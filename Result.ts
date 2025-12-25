const constants = {
    outputValueKey : "VALUE",
    outputPendingStates: ['PENDING','pending','Pending'],
    outputErrorStates: ['ERROR','Error','error','ERR','err','Err','FAIL','fail','Fail','FAILED','failed','Failed','FAILTURE','Failture','failture'],
    outputSucessStates: ['OK','Ok','ok','SUCCESS','Success','success','SUCCESSFUL','Successful','successful','PASS','Pass','pass']
    
}
enum ResultStatus {
    Failture,
    Successful,
    Pending
}
const _status = Symbol('status')
const _output = Symbol('output')
const _data = Symbol('data')

const resolveOutputString = Symbol('resolveOutputString')
const resolveOutputObject = Symbol('resolveOutputObject')
const resolveOutputDataStatus = Symbol('resolveOutputDataStatus')
class Result {
    [_status]?: ResultStatus
    [_output]:unknown
    [_data]: unknown
    constructor(output: unknown) {
        this[_output] = output
        if(!output) {
            this[_status] = ResultStatus.Successful
            this[_data] = {[constants.outputValueKey]: output}
            return
        }

        if (output instanceof Error) {
            this[_status] = ResultStatus.Failture
            this[_data] = output
            return
        }
        const outputType = typeof output
        let outputObject
        if (outputType==='string') {
            let isJson = false
            try{
                outputObject = JSON.stringify(output)
                isJson = true
            }catch{}
            if (!isJson) {
                const {status,value} = this[resolveOutputString](output as string)
                this[_status] = status
                this[_data] = {[constants.outputValueKey]:value}
                return
            }
        }
        if (outputObject) {

        }

    }
    get isException() {
        return this[_status] === ResultStatus.Failture 
            && this[_data]===this[_output]
            &&this[_data] instanceof Error  
    }
    [resolveOutputString](output: string): {status:ResultStatus,value?:unknown}{
        const pendingMatch = extractOutputString(constants.outputPendingStates,output)
        if(pendingMatch!==false) {
            return {status:ResultStatus.Pending,value: pendingMatch as string }
        }
        const errorMatch = extractOutputString(constants.outputErrorStates,output)
        if(errorMatch!==false) {
            return {status:ResultStatus.Failture,value: errorMatch as string }
        }
        const okMatch = extractOutputString(constants.outputSucessStates,output)
        if(okMatch!==false) {
            return {status:ResultStatus.Successful,value: okMatch as string }
        }
        return {status:ResultStatus.Successful,value: output}
    }
    [resolveOutputObject](output: Record<string,unknown>): {status:ResultStatus,data?:unknown}{
        const status = output['status']
        if (typeof status ==='number') {
            if (status===200) {
                const data = output.data as Record<string,unknown>
                if (typeof data==='object') {
                    const innerStatus = this[resolveOutputDataStatus](data)
                    return {status: innerStatus,data }
                }else{
                    return {status:ResultStatus.Successful,data:{[constants.outputValueKey]:data}}
                }
            }else {
                return {status: ResultStatus.Failture,data:output.data ?? {[constants.outputValueKey]:output.message} }
            }
        }else {
            const statusValue = this[resolveOutputDataStatus](output)
            return {status:statusValue,data: output}
        }
    }
    [resolveOutputDataStatus](data:Record<string,unknown>):ResultStatus {
        const isPending = checkOutputDataStatus(constants.outputPendingStates,data)
        if(isPending) {
            return ResultStatus.Pending
        }
        const isError = checkOutputDataStatus(constants.outputErrorStates,data)
        if(isError) {
            return ResultStatus.Failture
        }
        const isOk = checkOutputDataStatus(constants.outputSucessStates,data)
        if (isOk===false) {
            return ResultStatus.Failture
        }
        return ResultStatus.Successful
    }
}
