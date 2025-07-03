import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(correo: string, contrasenia: string) {
    const sql = `
      SELECT u.usu_id, u.usu_usuario, u.usu_correo, u.usu_contrasenia, u.rol_id, r.rol_nombre
      FROM tbl_usuarios u
      LEFT JOIN tbl_roles r ON u.rol_id = r.rol_id
      WHERE u.usu_correo = $1
      LIMIT 1
    `;
    const result = await this.dataSource.query(sql, [correo]);
    const usuario = result[0];

    if (!usuario) throw new UnauthorizedException('Correo no encontrado.');
    if ((usuario.usu_contrasenia || '').trim() !== contrasenia.trim()) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }
    if (!usuario.rol_id || !usuario.rol_nombre) {
      throw new ForbiddenException('Usuario sin rol asignado. Contacte al administrador.');
    }

    // Payload para el token
    const payload = {
      sub: usuario.usu_id,
      correo: usuario.usu_correo,
      rol: usuario.rol_id === 1 ? 'Administrador' : 'Empleado',
      usuario: usuario.usu_usuario,
    };
    const token = this.jwtService.sign(payload);

    return {
      mensaje: 'Inicio de sesión exitoso',
      token,
      rol: payload.rol,
      usuarioId: usuario.usu_id,
      correo: usuario.usu_correo,
      usuario: usuario.usu_usuario,
    };
  }
}
