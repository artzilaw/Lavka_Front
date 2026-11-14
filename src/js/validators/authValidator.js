/**
 * @module authValidator
 */

const AuthValidator = {
    USERNAME_REGEX: /^[\p{L}a-zA-Z0-9_\s'-]+$/u,
    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    LETTER_REGEX: /[a-zA-Z]/,
    DIGIT_REGEX: /[0-9]/,
    FORBIDDEN_REGEX: /[^a-zA-Z0-9_]/,
    USERNAME_MIN_LENGTH: 2,
    PASSWORD_MIN_LENGTH: 8,

    validateUsername(username) {
        if (!username) return false;
        const trimmed = username.trim();
        return trimmed.length >= this.USERNAME_MIN_LENGTH && this.USERNAME_REGEX.test(trimmed);
    },

    validateEmail(email) {
        if (!email) return false;
        return this.EMAIL_REGEX.test(email.trim());
    },

    validatePassword(password) {
        if (!password) {
            return {
                isValid: false,
                error: 'Пароль обязателен'
            };
        }

        if (password.length < this.PASSWORD_MIN_LENGTH) {
            return {
                isValid: false,
                error: `Пароль должен быть не менее ${this.PASSWORD_MIN_LENGTH} символов`
            };
        }

        const hasLetter = this.LETTER_REGEX.test(password);
        const hasDigit = this.DIGIT_REGEX.test(password);
        const hasForbidden = this.FORBIDDEN_REGEX.test(password);

        if (hasForbidden) {
            return {
                isValid: false,
                error: 'Пароль может содержать только латинские буквы, цифры и нижнее подчёркивание'
            };
        }

        if (!hasLetter && !hasDigit) {
            return {
                isValid: false,
                error: 'Пароль должен содержать хотя бы одну букву и одну цифру'
            };
        }

        if (!hasLetter) {
            return {
                isValid: false,
                error: 'Пароль должен содержать хотя бы одну букву'
            };
        }

        if (!hasDigit) {
            return {
                isValid: false,
                error: 'Пароль должен содержать хотя бы одну цифру'
            };
        }

        return {
            isValid: true,
            error: null
        };
    },

    validateLogin(email, password) {
        if (!email || !password) {
            return {
                isValid: false,
                error: 'Заполните поля'
            };
        }
        if (!this.validateEmail(email)) {
            return {
                isValid: false,
                error: 'Неверный email или пароль'
            };
        }
        return {
            isValid: true,
            error: null
        };
    },

    validateRegister(name, email, password, confirmPassword) {
        const fieldErrors = {
            name: null,
            email: null,
            password: null,
            confirmPassword: null
        };

        if (!name || !name.trim()) {
            fieldErrors.name = 'Имя обязательно';
        } else if (name.trim().length < this.USERNAME_MIN_LENGTH) {
            fieldErrors.name = `Имя должно содержать минимум ${this.USERNAME_MIN_LENGTH} символа`;
        } else if (!this.validateUsername(name)) {
            fieldErrors.name = 'Имя содержит недопустимые символы';
        }

        if (!email || !email.trim()) {
            fieldErrors.email = 'Email обязателен';
        } else if (!this.validateEmail(email)) {
            fieldErrors.email = 'Некорректный формат email';
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
            fieldErrors.password = passwordValidation.error;
        }

        if (password !== confirmPassword) {
            fieldErrors.confirmPassword = 'Пароли не совпадают';
        }

        const hasErrors = Object.values(fieldErrors).some(error => error !== null);
        return {
            isValid: !hasErrors,
            fieldErrors,
            errors: Object.values(fieldErrors).filter(e => e !== null)
        };
    }
};

export { AuthValidator };
