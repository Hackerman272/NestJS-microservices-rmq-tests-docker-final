import {Body, HttpException, HttpStatus, Inject, Injectable, Post, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from "bcryptjs"
import {User} from "../users/user.model";
import * as process from "process";
import {firstValueFrom} from "rxjs";
import {ClientProxy} from "@nestjs/microservices";
import {RolesService} from "../roles/roles.service";
import {RegistrationDtoDto} from "./dto/registration.dto";
import {LoginDto} from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(private userService: UsersService,
                private jwtService: JwtService,
                @Inject('PROFILE_SERVICE') readonly profileClient: ClientProxy) {
        this.profileClient.connect().then(result => console.log(result)).catch(error => console.log(error));
    }

    async login(loginDto: LoginDto){
        const user = await this.validateUser(loginDto)
        return await this.generateToken(user)
    }

    async registration(registrationDto: RegistrationDtoDto){
        const createProfileResponse = await firstValueFrom(
            this.profileClient.send('profile_create', registrationDto),
        );
        const candidate = await this.userService.getUserByEmail(registrationDto.email)
        if (candidate) {
            throw new HttpException('Пользователь с таким email уже есть', HttpStatus.BAD_REQUEST)
        }
        const hashPassword = await bcrypt.hash(registrationDto.password, 5);
        const user = await this.userService.createUser({...registrationDto,
            password: hashPassword,
            profileId: createProfileResponse.id
        })
        return { userId: user.id,
            authInfo: await this.generateToken(user),
            profileInfo: {...createProfileResponse}
        }
    }

    private async generateToken(user: User) {
        const payload = {email: user.email, id: user.id, roles: user.roles}
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(loginDto: LoginDto) {
        const user = await this.userService.getUserByEmail(loginDto.email);
        const passwordEquals = await bcrypt.compare(loginDto.password, user.password);
        if (user && passwordEquals) {
            return user;
        }
        // для проверки корректности/наличия email нужна дополнительная проверка, данной недостаточно.
        throw new UnauthorizedException({message: 'Некорректный пароль'})
    }
}
