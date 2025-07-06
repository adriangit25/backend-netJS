import { ApiProperty } from '@nestjs/swagger';

export class AsignarRolDto {
    @ApiProperty()
    usuarioId: number;

    @ApiProperty()
    rolId: number;
}
