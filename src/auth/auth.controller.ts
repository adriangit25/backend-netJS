import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Login')
@Controller('api/login')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
    @ApiResponse({ status: 401, description: 'Correo o contraseña incorrectos.' })
    async login(@Body() loginDto: LoginDto) {
        if (!loginDto.correo || !loginDto.contrasenia) {
            throw new BadRequestException('Por favor, ingrese correo y contraseña.');
        }
        return this.authService.validateUser(loginDto.correo, loginDto.contrasenia);
    }
}
