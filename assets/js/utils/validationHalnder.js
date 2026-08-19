export function validateInput(inputs = {}){
    if(inputs.username){
        if(inputs.username.trim() === "" || inputs.username.length < 3 || inputs.username.length > 20 || inputs.username.includes(" ") || !isAlpha(inputs.username)){
            return {"error": "Username must be alphanumeric and between 3 and 20 characters long.", "code": "INVALID USERNAME", "isValid": false};

        }
    }
    if(inputs.password){
        const strength = getPasswordStrength(inputs.password);
        if(inputs.password.trim() === "" || inputs.password.length < 6 || inputs.password.length > 20 || inputs.password.includes(" ")){
            return {"error": "Password must be alphanumeric and between 6 and 20 characters long.", strength, "code": "INVALID PASSWORD", "isValid": false};
        }
    
    }
    if(inputs.age) {
        if (inputs.age < 18 || inputs.age !== parseInt(inputs.age)) {
            return {"error": "age must be "}
        }
    }
<<<<<<< HEAD
    else {
        return {'isValid' : true}
    }
=======
>>>>>>> 5baacea (added a profile section new refactored code bugs fixes and ui/ux improvements)
}

function isAlpha(char) {
    return char.match(/^[a-zA-Z]+$/);
}
export function getPasswordStrength(password) {
    if (!password || password.length === 0) return { label: "Empty", score: 0 };

    let score = 0;

    if (password.length >= 8) score += 2;
    if (password.length >= 12) score += 2;
    if (password.length >= 16) score += 2;

    const variations = {
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    const variationCount = Object.values(variations).filter(Boolean).length;
    score += (variationCount * 2);

    const sequences = ["12345678", "abcdefgh", "qwertyui", "asdfghjkl"];
    sequences.forEach(seq => {
        if (password.toLowerCase().includes(seq.substring(0, 4))) score -= 3;
    });
    if (/(.)\1\1/.test(password)) score -= 2;


    if (score <= 4) return { label: "Weak", score };
    if (score <= 8) return { label: "Medium", score };
    return { label: "Strong", score };
}
