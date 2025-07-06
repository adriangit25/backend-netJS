import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'correo@gmail.com', description: 'Correo del usuario' })
    correo: string;

    @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
    contrasenia: string;
}
