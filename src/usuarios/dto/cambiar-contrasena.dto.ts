import { ApiProperty } from '@nestjs/swagger';

export class CambiarContrasenaDto {
    @ApiProperty()
    correo: string;

    @ApiProperty()
    nuevaContrasena: string;

    @ApiProperty()
    confirmarContrasena: string;
}
