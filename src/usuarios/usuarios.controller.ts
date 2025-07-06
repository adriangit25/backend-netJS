import { Controller, Get, Post, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CrearRegistroDto } from './dto/crear-registro.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Usuarios')
@UseGuards(JwtAuthGuard)
@Controller('api/usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @Get()
    @ApiOperation({ summary: 'Obtener usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
    async getUsuarios(@Req() req) {
        // Ahora extraes el rol y userId del token (req.user)
        return this.usuariosService.getUsuarios(req.user.rol, req.user.userId);
    }

    @Get('registros')
    @ApiOperation({ summary: 'Obtener registros' })
    async getRegistros(@Req() req) {
        return this.usuariosService.getRegistros(req.user.rol, req.user.userId);
    }

    @Post('crearUsuario')
    @ApiOperation({ summary: 'Crear usuario' })
    @ApiBody({ type: CrearUsuarioDto })
    async crearUsuario(@Req() req, @Body() dto: CrearUsuarioDto) {
        // Solo administrador
        if (req.user.rol !== 'Administrador') {
            throw new ForbiddenException('Solo un administrador puede crear usuarios.');
        }
        return this.usuariosService.crearUsuario(dto);
    }

    @Post('registro')
    @ApiOperation({ summary: 'Crear registro' })
    @ApiBody({ type: CrearRegistroDto })
    async crearRegistro(@Req() req, @Body() dto: CrearRegistroDto) {
        return this.usuariosService.crearRegistro(dto);
    }

    @Post('asignarRol')
    @ApiOperation({ summary: 'Asignar rol a usuario' })
    @ApiBody({ type: AsignarRolDto })
    async asignarRol(@Req() req, @Body() dto: AsignarRolDto) {
        // Solo administrador
        if (req.user.rol !== 'Administrador') {
            throw new ForbiddenException('Solo un administrador puede asignar roles.');
        }
        return this.usuariosService.asignarRol(dto);
    }

    @Get('roles')
    @ApiOperation({ summary: 'Obtener roles' })
    async getRoles() {
        return this.usuariosService.getRoles();
    }

    @Put('cambiarContrasena')
    @ApiOperation({ summary: 'Cambiar contraseña' })
    @ApiBody({ type: CambiarContrasenaDto })
    async cambiarContrasena(@Body() dto: CambiarContrasenaDto) {
        return this.usuariosService.cambiarContrasena(dto);
    }
}
