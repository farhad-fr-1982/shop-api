import { SetMetadata } from "@nestjs/common"

export const PERMISSION_KEY = 'permissions'
export const Permissions =(...params:string[])=>SetMetadata(PERMISSION_KEY,params)