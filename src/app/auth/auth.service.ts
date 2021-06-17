import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";
import { environment } from "../../environments/environment";

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    // signUpUrl: string = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCPTl508ghChhws2QTTMY32-6lARtcbBKU';
    // loginUrl: string = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCPTl508ghChhws2QTTMY32-6lARtcbBKU';
    signupUrl: string = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey;
    loginUrl: string = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey;
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router) { }

    signUp(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            this.signupUrl,
            {
                email: email,
                password: password,
                returnSecureToken: true
            })
            .pipe(catchError(this.handleError), tap(responseData => this.handleAuthentication(responseData)));
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            this.loginUrl,
            {
                email: email,
                password: password,
                returnSecureToken: true
            })
            .pipe(catchError(this.handleError), tap(responseData => this.handleAuthentication(responseData)));
    }

    logout() {
        this.user.next(null);
        localStorage.removeItem('userData');
        this.router.navigate(['/auth'])

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }

        this.tokenExpirationTimer = null;
    }

    private handleAuthentication(responseData: AuthResponseData) {
        var expiresInTime = +responseData.expiresIn * 1000;
        var expirationDate = new Date(new Date().getTime() + expiresInTime);
        const newUser = new User(responseData.email, responseData.localId, responseData.idToken, expirationDate);
        // console.log(newUser);
        this.user.next(newUser);
        this.autoLogout(expiresInTime);
        localStorage.setItem('userData', JSON.stringify(newUser));
    }

    autoLogin() {
        var userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }

        var loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate));

        if (loadedUser.token) {
            this.user.next(loadedUser);
            var expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            //console.log("Expiration Duration:" + expirationDuration);
            this.autoLogout(expirationDuration);
        }
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout()
        }, expirationDuration);
    }

    private handleError(errorResponse: HttpErrorResponse) {
        var errorMessage = 'An unknown error occurred!';
        if (!errorResponse.error || !errorResponse.error.error) {
            return throwError(errorMessage);
        }

        switch (errorResponse.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'The email address is already in use by another account.';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'The password is invalid or the user does not have a password.';
                break;
        }

        console.log(errorMessage);

        return throwError(errorMessage);
    }
}