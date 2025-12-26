export class Named{
    constructor(public value:string){}
}
export class Syntax {
    units:Record<string,SyntaxUnit>
    public constructor() {
        this.units = {}
    }
    static named(name:string):Named {
        return new Named(name)
    }
    
    
}
class SyntaxBuilder {
    unit:SyntaxUnit
    constructor(public syntax:Syntax,public name:string) {

    }
    regx(regText:string):RegxUnit {
        return new RegxUnit(undefined,regText)
    }
    seq(...arg:unknown[]):SequenceUnit {
        if (this.unit) throw new Error('already defined')
        const seq = new SequenceUnit(undefined)
        for(let sub of arg) {
            seq.concat(sub as string)
        }
        this.syntax.units[this.name] = seq
        return this.unit = seq
    }
    alt(...arg:unknown[]):AlternativeUnit {
        const alt = new AlternativeUnit(undefined)
        for(let sub of arg) {
            alt.choice(sub as string)
        }
        this.syntax.units[this.name] = alt
        return this.unit = alt
    }
}


export class SyntaxUnit<TSelf extends SyntaxUnit<any> = SyntaxUnit<any>> {
    syntax:Syntax
    parent:SyntaxUnit
    constructor(parent:SyntaxUnit | Syntax) {
        if (parent) {
            if (parent instanceof SyntaxUnit) {
                this.parent = parent
                this.syntax = parent.syntax
            }else {
                this.syntax = parent as Syntax
            }
        }
    }
    clone(parent:SyntaxUnit):TSelf{
        return new SyntaxUnit(parent) as TSelf
    }
}

export class RegxUnit extends SyntaxUnit<RegxUnit> {
    regx:RegExp
    constructor(parent:SyntaxUnit|Syntax, public reg:string|RegExp) {
        super(parent)
        this.regx = typeof reg ==='string'? new RegExp(reg) : reg
    }
    clone(parent:SyntaxUnit):RegxUnit {
        const clone = new RegxUnit(parent,this.regx)
        return clone
    }
}
// alternative 
export class SequenceUnit extends SyntaxUnit {
    units:Array<SyntaxUnit>
    constructor(parent:SyntaxUnit) {
        super(parent)
        this.units = []
    }
    clone(parent:SyntaxUnit):SequenceUnit {
        const clone = new SequenceUnit(parent)
        for(const u of this.units) {
            const subUnit = u.clone(clone)
            clone.units.push(subUnit)
        }
        return clone
    }
    concat(unit:string|Named|SyntaxUnit):SequenceUnit {
        if (typeof unit ==='string') {
            this.units.push(new RegxUnit(this,unit))
        }else if (unit instanceof Named) {
            const u = this.syntax.units[unit.value]
            if (!u) throw new Error(`cannot find named syntax unit:${unit.value}`)
            this.units.push(u.clone(this))
        }else if (unit instanceof SyntaxUnit) {
            this.units.push(unit.clone(this))
        }else {
            throw new Error('invalid argument: unit')
        }
        
        return this
    }
    
}

export class AlternativeUnit extends SyntaxUnit<AlternativeUnit> {
    units:Array<SyntaxUnit>
    constructor(parent:SyntaxUnit ) {
        super(parent)
        this.units = []
    }
    choice(unit:string|Named|SyntaxUnit):AlternativeUnit {
        if (typeof unit ==='string') {
            this.units.push(new RegxUnit(this,unit))
        }else if (unit instanceof Named) {
            const u = this.syntax.units[unit.value]
            if (!u) throw new Error(`cannot find named syntax unit:${unit.value}`)
            this.units.push(u.clone(this))
        }else if (unit instanceof SyntaxUnit) {
            this.units.push(unit.clone(this))
        }else {
            throw new Error('invalid argument: unit')
        }
        
        return this
    }
    clone(parent:SyntaxUnit):AlternativeUnit {
        const clone = new AlternativeUnit(parent)
        for(const u of this.units) {
            const subUnit = u.clone(clone)
            clone.units.push(subUnit)
        }
        return clone
    }
}
