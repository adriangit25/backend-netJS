import { ApiProperty } from '@nestjs/swagger';

export class CrearRegistroDto {
    @ApiProperty()
    reg_nombre: string;
    @ApiProperty()
    reg_apellido: string;
    @ApiProperty()
    reg_telefono: string;
    @ApiProperty()
    reg_estado: number;
    @ApiProperty()
    reg_fechaNacimiento: string;
}
