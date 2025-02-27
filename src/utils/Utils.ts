import { FlagType } from "../game/GameManager"

export function isHexColor (hex:string):boolean {
    return typeof hex === 'string'
        && hex.length === 6
        && !isNaN(Number('0x' + hex))
  }
export function isInFlags(flags:FlagType[],flag:string):boolean{
    const value=flags.find((v) => {
        if(v.id_flag == flag) {
            return true;
        }
    });
    return value ? true : false;
}
