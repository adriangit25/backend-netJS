import { Injectable, BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CrearRegistroDto } from './dto/crear-registro.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';

@Injectable()
export class UsuariosService {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

    async getUsuarios(rolNombre: string, userId: number) {
        if (rolNombre === 'Administrador') {
            const sql = `
        SELECT u.*, r.rol_nombre, rg.*
        FROM tbl_usuarios u
        LEFT JOIN tbl_roles r ON u.rol_id = r.rol_id
        LEFT JOIN tbl_registro rg ON u.usu_registro_id = rg.reg_id
      `;
            return this.dataSource.query(sql);
        } else if (rolNombre === 'Empleado' && userId) {
            const sql = `
        SELECT u.*, r.rol_nombre, rg.*
        FROM tbl_usuarios u
        LEFT JOIN tbl_roles r ON u.rol_id = r.rol_id
        LEFT JOIN tbl_registro rg ON u.usu_registro_id = rg.reg_id
        WHERE u.usu_id = $1
      `;
            return this.dataSource.query(sql, [userId]);
        }
        throw new ForbiddenException('Usuario sin permisos.');
    }

    async getRegistros(rolNombre: string, userId: number) {
        if (rolNombre === 'Administrador') {
            return this.dataSource.query('SELECT * FROM tbl_registro');
        } else if (rolNombre === 'Empleado' && userId) {
            const usuario = await this.dataSource.query(
                'SELECT * FROM tbl_usuarios WHERE usu_id = $1',
                [userId],
            );
            if (!usuario[0] || !usuario[0].usu_registro_id) throw new NotFoundException();
            const registro = await this.dataSource.query(
                'SELECT * FROM tbl_registro WHERE reg_id = $1',
                [usuario[0].usu_registro_id],
            );
            return registro;
        }
        throw new ForbiddenException('Usuario sin permisos.');
    }

    async crearUsuario(dto: CrearUsuarioDto) {
        // 1. Registrar o reutilizar registro
        let usuRegistroId = dto.usu_registro_id ?? dto.registro?.regId ?? null;
        if (dto.registro && (!usuRegistroId || usuRegistroId === 0)) {
            // Checa si ya existe un registro igual (opcional)
            // Si quieres buscar por nombre/apellido, aquí puedes agregar el select

            const registroSql = `
          INSERT INTO tbl_registro (reg_apellido, reg_estado, "reg_fechaNacimiento", reg_nombre, reg_telefono)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING reg_id
        `;
            const registroValues = [
                dto.registro.regApellido,
                dto.registro.regEstado ?? 1,
                dto.registro.regFechaNacimiento,
                dto.registro.regNombre,
                dto.registro.regTelefono,
            ];
            const registroResult = await this.dataSource.query(registroSql, registroValues);
            usuRegistroId = registroResult[0].reg_id;
        }

        // 2. Registrar o reutilizar rol
        let rolId = dto.rol_id ?? dto.rol?.rolId ?? null;
        if (dto.rol && (!rolId || rolId === 0)) {
            // Puedes validar si existe ese rol antes, aquí lo crea siempre
            const rolSql = `
          INSERT INTO tbl_roles (rol_nombre)
          VALUES ($1)
          RETURNING rol_id
        `;
            const rolValues = [dto.rol.rolNombre];
            const rolResult = await this.dataSource.query(rolSql, rolValues);
            rolId = rolResult[0].rol_id;
        }

        // 3. Crear usuario
        const sql = `
      INSERT INTO tbl_usuarios
      (rol_id, usu_contrasenia, usu_correo, usu_estado, usu_registro_id, usu_usuario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING usu_id
    `;
        const values = [
            rolId,
            dto.usu_contrasenia,
            dto.usu_correo,
            dto.usu_estado ?? 1,
            usuRegistroId,
            dto.usu_usuario
        ];
        const result = await this.dataSource.query(sql, values);
        return { usu_id: result[0].usu_id };
    }

    async crearRegistro(dto: CrearRegistroDto) {
        const sql = `
      INSERT INTO tbl_registro
      (reg_nombre, reg_apellido, reg_telefono, reg_estado, "reg_fechaNacimiento")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [
            dto.reg_nombre,
            dto.reg_apellido,
            dto.reg_telefono,
            dto.reg_estado,
            dto.reg_fechaNacimiento,
        ];
        const result = await this.dataSource.query(sql, values);
        return result[0];
    }

    async asignarRol(dto: AsignarRolDto) {
        const usuario = await this.dataSource.query(
            'SELECT * FROM tbl_usuarios WHERE usu_id = $1',
            [dto.usuarioId],
        );
        if (!usuario[0]) throw new NotFoundException('Usuario no encontrado.');

        const rol = await this.dataSource.query(
            'SELECT * FROM tbl_roles WHERE rol_id = $1',
            [dto.rolId],
        );
        if (!rol[0]) throw new BadRequestException('El rol especificado no existe.');

        await this.dataSource.query(
            'UPDATE tbl_usuarios SET rol_id = $1 WHERE usu_id = $2',
            [dto.rolId, dto.usuarioId],
        );

        return { mensaje: `Rol asignado correctamente a ${usuario[0].usu_correo}.` };
    }

    async getRoles() {
        return this.dataSource.query('SELECT * FROM tbl_roles');
    }

    async cambiarContrasena(dto: CambiarContrasenaDto) {
        if (dto.nuevaContrasena !== dto.confirmarContrasena) {
            throw new BadRequestException('Las contraseñas no coinciden.');
        }
        const usuario = await this.dataSource.query(
            'SELECT * FROM tbl_usuarios WHERE usu_correo = $1',
            [dto.correo],
        );
        if (!usuario[0]) throw new UnauthorizedException('Correo no encontrado.');

        await this.dataSource.query(
            'UPDATE tbl_usuarios SET usu_contrasenia = $1 WHERE usu_correo = $2',
            [dto.nuevaContrasena, dto.correo],
        );

        return { mensaje: 'Contraseña cambiada con éxito.' };
    }
}
