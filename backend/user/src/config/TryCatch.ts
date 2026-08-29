import type { RequestHandler,Request, NextFunction,Response } from "express"//wrapper function , no need to write try catch all the time for all routes 

const TryCatch=(handler:RequestHandler):RequestHandler=>{//its a function taking a function -- basically handler is a function for routes
    return async(req:Request,res:Response,next:NextFunction)=>{//returns a new function
        try{
            await handler(req,res,next)
        }
        catch(error:any){
            res.status(500).json({
                message:error.message
            })

        }
    }//returning a safe version of this route handler 
}

export default TryCatch