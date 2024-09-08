import multer from 'multer'
const id : number = 2;
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,`./temp/Applciant_dataNow_${id}`)
    },
    filename : function(req,file,cb){
        cb(null,file.originalname)
    }
})

export const upload = multer({storage : storage})
