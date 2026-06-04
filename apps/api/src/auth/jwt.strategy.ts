import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import 'dotenv/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Le dice a Passport dónde buscar el JWT en cada request
      // Lo busca en el header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Si el token expiró, rechaza la petición automáticamente
      ignoreExpiration: false,

      // La misma clave secreta con la que firmamos el token
      // Passport la usa para verificar que el token no fue manipulado
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
    });
  }

  // Este método se ejecuta DESPUÉS de que Passport verifica la firma del JWT
  // El parámetro "payload" es lo que guardamos dentro del token al hacer login
  async validate(payload: { sub: string; email: string; role: string }) {
    // Lo que retornamos aquí queda disponible como "request.user" en los controllers
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}