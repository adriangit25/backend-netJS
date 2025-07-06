import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'supersecretkey'),
        });
    }

    async validate(payload: any) {
        // req.user tendrá esto disponible en endpoints protegidos
        return {
            userId: payload.sub,
            correo: payload.correo,
            rol: payload.rol,
            usuario: payload.usuario,
        };
    }
}
