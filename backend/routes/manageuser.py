from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import bcrypt
import re
from database import get_db_connection


router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    password: str
    status: str
    createdby: str

class UserLogin(BaseModel):
    username: str  # Can be name or email
    password: str

class UserUpdate(BaseModel):
    user_id: str
    password: str = None  # Optional - only update if provided
    role: str
    status: str
    modifiedby: str

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hashed password"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/createUser")
async def create_user(user_data: UserCreate):
    try:
        # Validate input data
        if not user_data.name.strip():
            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty"
            )
        
        if not validate_email(user_data.email):
            raise HTTPException(
                status_code=400,
                detail="Invalid email format"
            )
        
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long"
            )
        
        if user_data.role not in ['admin', 'user', 'manager']:
            raise HTTPException(
                status_code=400,
                detail="Role must be one of: admin, user, manager"
            )
        
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Check if user already exists
            check_user_query = """
            SELECT COUNT(*) FROM WATER_USERS 
            WHERE UPPER(USER_EMAIL) = UPPER(:email) or UPPER(USER_NAMA) = UPPER(:name)
            """
            
            cursor.execute(check_user_query, {"email": user_data.email, "name": user_data.name})
            user_exists = cursor.fetchone()[0]
            
            if user_exists > 0:
                return {
                    "status": "failed",
                    "message": "User already exists. Email or username is already registered.",
                    "success": False
                }
            
            # Hash the password
            hashed_password = hash_password(user_data.password)
            
            # Insert new user (sample query - you can update this)
            insert_user_query = """
            INSERT INTO WATER_USERS (USER_NAMA, USER_EMAIL, USER_ROLE, USER_PASSWORD, DATECREATED, USER_STATUS, CREATEDBY, MODIFIEDBY, DATEMODIFIED) 
            VALUES (:name, :email, :role, :password, :status, SYSDATE, :createdby, :createdby, SYSDATE)
            """
            
            cursor.execute(insert_user_query, {
                "name": user_data.name,
                "email": user_data.email,
                "role": user_data.role,
                "password": hashed_password,
                "status": user_data.status,
                "createdby": user_data.createdby
            })
            
            # Commit the transaction
            conn.commit()
            
            return {
                "status": "success",
                "message": "User created successfully!",
                "success": True,
                "data": {
                    "name": user_data.name,
                    "email": user_data.email,
                    "role": user_data.role
                }
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during user creation: {str(e)}"
        )

@router.post("/LoginUser")
async def login_user(login_data: UserLogin):
    try:
        # Validate input data
        if not login_data.username.strip():
            raise HTTPException(
                status_code=400,
                detail="Username cannot be empty"
            )
        
        if not login_data.password.strip():
            raise HTTPException(
                status_code=400,
                detail="Password cannot be empty"
            )
        
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Query to find user by name or email (sample query - you can update this)
            find_user_query = """
            SELECT USER_NAMA, USER_EMAIL, USER_ROLE, USER_PASSWORD, USER_STATUS 
            FROM WATER_USERS 
            WHERE (UPPER(USER_NAMA) = UPPER(:username) OR UPPER(USER_EMAIL) = UPPER(:username))
            AND USER_STATUS = 'ACTIVE'
            """
            
            cursor.execute(find_user_query, {"username": login_data.username})
            user_record = cursor.fetchone()
            
            # Check if user exists
            if not user_record:
                return {
                    "status": "failed",
                    "message": "User not found. Please check your username.",
                    "success": False
                }
            
            # Extract user data
            name, email, role, stored_password, status = user_record
            
            # Verify password
            if not verify_password(login_data.password, stored_password):
                return {
                    "status": "failed", 
                    "message": "Password wrong. Please check your password.",
                    "success": False
                }
            
            # Successful login
            return {
                "status": "success",
                "message": "Login successful!",
                "success": True,
                "data": {
                    "name": name,
                    "email": email,
                    "role": role
                }
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during login: {str(e)}"
        )

@router.get("/ListUsers")
async def list_users():
    try:
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Query to get all users (sample query - you can update this)
            list_users_query = """
            SELECT ID, USER_NAMA, USER_EMAIL, USER_ROLE, USER_STATUS, DATEMODIFIED, DATECREATED 
            FROM WATER_USERS 
            ORDER BY DATEMODIFIED DESC
            """
            
            cursor.execute(list_users_query)
            users_records = cursor.fetchall()
            
            # Convert records to list of dictionaries
            users_list = []
            for record in users_records:
                user_id, name, email, role, status, datecreated, datemodified = record
                users_list.append({
                    "id": str(user_id),
                    "username": name,
                    "email": email,
                    "role": role,
                    "status": status,
                    "datecreated": datecreated,
                    "datemodified": datemodified
                })
            
            return {
                "status": "success",
                "message": "Users retrieved successfully!",
                "success": True,
                "data": users_list,
                "total": len(users_list)
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.put("/UpdateUser")
async def update_user(update_data: UserUpdate):
    try:
        # Validate input data
        if not update_data.user_id.strip():
            raise HTTPException(
                status_code=400,
                detail="User ID cannot be empty"
            )
        
        if update_data.role not in ['admin', 'user', 'manager']:
            raise HTTPException(
                status_code=400,
                detail="Role must be one of: admin, user, manager"
            )
        
        if update_data.status not in ['ACTIVE', 'INACTIVE']:
            raise HTTPException(
                status_code=400,
                detail="Status must be ACTIVE or INACTIVE"
            )
        
        # Validate password if provided
        if update_data.password and len(update_data.password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long"
            )
        
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Check if user exists
            check_user_query = """
            SELECT COUNT(*) FROM WATER_USERS 
            WHERE ID = :user_id
            """
            
            cursor.execute(check_user_query, {"user_id": update_data.user_id})
            user_exists = cursor.fetchone()[0]
            
            if user_exists == 0:
                return {
                    "status": "failed",
                    "message": "User not found.",
                    "success": False
                }
            
            # Prepare update query based on whether password is provided
            if update_data.password:
                # Hash the new password
                hashed_password = hash_password(update_data.password)
                
                # Update user with password (sample query - you can update this)
                update_user_query = """
                UPDATE WATER_USERS 
                SET USER_ROLE = :role, 
                    USER_STATUS = :status, 
                    USER_PASSWORD = :password,
                    MODIFIEDBY = :modifiedby,
                    DATEMODIFIED = SYSDATE
                WHERE ID = :user_id
                """
                
                cursor.execute(update_user_query, {
                    "role": update_data.role,
                    "status": update_data.status.upper(),
                    "password": hashed_password,
                    "modifiedby": update_data.modifiedby,
                    "user_id": update_data.user_id
                })
            else:
                # Update user without password (sample query - you can update this)
                update_user_query = """
                UPDATE WATER_USERS 
                SET USER_ROLE = :role, 
                    USER_STATUS = :status,
                    MODIFIEDBY = :modifiedby,
                    DATEMODIFIED = SYSDATE
                WHERE ID = :user_id
                """
                
                cursor.execute(update_user_query, {
                    "role": update_data.role,
                    "status": update_data.status.upper(),
                    "modifiedby": update_data.modifiedby,
                    "user_id": update_data.user_id
                })
            
            # Check if any rows were affected
            if cursor.rowcount == 0:
                return {
                    "status": "failed",
                    "message": "No changes were made to the user.",
                    "success": False
                }
            
            # Commit the transaction
            conn.commit()
            
            return {
                "status": "success",
                "message": "User updated successfully!",
                "success": True,
                "data": {
                    "user_id": update_data.user_id,
                    "role": update_data.role,
                    "status": update_data.status,
                    "password_updated": bool(update_data.password)
                }
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating user: {str(e)}"
        )