import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Recipe } from "../recipes/recipe.model";
import { RecipeService } from "../recipes/recipe.service";
import { exhaustMap, map, take, tap } from 'rxjs/operators';
import { AuthService } from "../auth/auth.service";

@Injectable({ providedIn: 'root' })
export class DataStorageService {
    url = 'https://homefoodmenuplanner-default-rtdb.europe-west1.firebasedatabase.app/recipes.json';

    constructor(
        private http: HttpClient,
        private recipeService: RecipeService,
        private authService: AuthService) { }

    storeRecipes() {
        var recipes = this.recipeService.getRecipes();
        this.http.put(this.url, recipes).subscribe(response => {
            console.log(response);
        });
    }

    fetchRecipes() {
        // var recipes = this.recipeService.getRecipes();

        // return this.authService.user.pipe(
        // take(1), 
        // exhaustMap(user => {
        //     return this.http.get<Recipe[]>(this.url, { params: new HttpParams().set('auth', user.token) });
        // }), // in interceptors

        return this.http.get<Recipe[]>(this.url).pipe(
            map(recipes => {
                return recipes.map(recipe => {
                    return { ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] };
                })
            }),
            tap(response => {
                console.log(response);
                this.recipeService.setRecipes(response);
            })
        );

    }
}