const { hash } = require("bcryptjs");
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite")

class UsersController {
    async create(request, response){
        const { name, email, password } = request.body;

        const database = await sqliteConnection();
        const checkUserExist = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(checkUserExist){
            throw new AppError("Este email já está em uso.");
        }

        const hashedPassword = await hash(password, 8);

        await database.run("INSERT INTO users (name,email,password) VALUES (?, ?, ?)", [name, email, hashedPassword])

        return response.status(201).json();

    }

    async update(response, request){
        const { name, email, password, old_password } = request.body;
        const user_id = request.user.id;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [ user_id ]);

        if(!user){
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdateEmail = await database.get("SELECT * FROM users WHERE email = (?)", [ email ]);

        if(userWithUpdateEmail && userWithUpdateEmail.id !== user_id){
            throw new AppError("Este e-mail já está em uso.");
        }
        
        return response.json();

    }
}

module.exports = UsersController;