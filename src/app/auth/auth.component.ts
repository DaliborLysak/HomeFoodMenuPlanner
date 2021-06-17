import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthResponseData, AuthService } from "./auth.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceholderDirective, { static: true }) alertHost: PlaceholderDirective;

    private closeSub: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver) { }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        let authObservable: Observable<AuthResponseData>;
        var email = form.value.email;
        var password = form.value.password;
        this.isLoading = true;

        if (this.isLoginMode) {
            authObservable = this.authService.login(email, password);
        } else {
            authObservable = this.authService.signUp(email, password);
        }

        authObservable.subscribe(response => {
            // console.log(response);
            this.isLoading = false;
            this.router.navigate(['/recipes']);
        }, error => {
            // console.log(error);
            this.error = error;
            // this.showErrorAlert(error)
            this.isLoading = false;
        });

        form.reset();
    }

    onHandleError() {
        this.error = null;
    }

    // showErrorAlert(message: string) {
    //     var alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    //     var hostViewContainerRef = this.alertHost.viewContainerRef;
    //     hostViewContainerRef.clear();

    //     var componentRef = hostViewContainerRef.createComponent(alertComponentFactory);
    //     componentRef.instance.message = message;
    //     this.closeSub = componentRef.instance.close.subscribe(() => {
    //         this.closeSub.unsubscribe();
    //         hostViewContainerRef.clear();
    //     })
    // }

    ngOnDestroy() {
        if (this.closeSub) {
            this.closeSub.unsubscribe();
        }
    }
}
