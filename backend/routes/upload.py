from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload file endpoint that accepts multipart/form-data
    Returns filename and size information
    """
    try:
        # Read file content to get size
        content = await file.read()
        file_size = len(content)
        
        # Reset file pointer for potential future use
        await file.seek(0)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "File uploaded successfully",
                "filename": file.filename,
                "size": file_size,
                "content_type": file.content_type
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error uploading file: {str(e)}"
        )