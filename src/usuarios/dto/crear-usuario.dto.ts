import { ApiProperty } from '@nestjs/swagger';

export class RolDto {
    @ApiProperty()
    rolId: number;
    @ApiProperty()
    rolNombre: string;
}

export class RegistroDto {
    @ApiProperty()
    regId: number;
    @ApiProperty()
    regNombre: string;
    @ApiProperty()
    regApellido: string;
    @ApiProperty()
    regTelefono: string;
    @ApiProperty()
    regEstado: number;
    @ApiProperty()
    regFechaNacimiento: string;
}

export class CrearUsuarioDto {
    @ApiProperty()
    usu_usuario: string;

    @ApiProperty()
    usu_correo: string;

    @ApiProperty()
    usu_contrasenia: string;

    @ApiProperty({ required: false })
    usu_estado?: number;

    @ApiProperty({ required: false })
    rol_id?: number;

    @ApiProperty({ required: false })
    usu_registro_id?: number;

    @ApiProperty({ required: false, type: () => RolDto })
    rol?: RolDto;

    @ApiProperty({ required: false, type: () => RegistroDto })
    registro?: RegistroDto;
}
