import {Body, Controller, Post} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {RegistrationDtoDto} from "./dto/registration.dto";
import {EventPattern} from "@nestjs/microservices";
import {LoginDto} from "./dto/login.dto";

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }
    @Post('/login')
    login(@Body()  loginDto: LoginDto){
        return this.authService.login(loginDto)
    }

    @Post('/registration')
    registration(@Body()  registrationDto: RegistrationDtoDto){
        return this.authService.registration(registrationDto)
    }
}
