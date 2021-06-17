import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Recipe } from "./recipe.model";

@Injectable({ providedIn: 'root' })
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [
    // new Recipe(
    //     'boruvkovy kolac',
    //     'boruvkovy kolac popis',
    //     'https://www.toprecepty.cz/fotky/recepty/0046/hrnickovy-boruvkovy-kolac-na-plechu-116495-1920-1080.jpg',
    //     [
    //         new Ingredient('boruvky', 100),
    //         new Ingredient('mouka', 200)
    //     ]),
    // new Recipe(
    //     'cheescake', 
    //     'cheescake popis', 
    //     'https://assets.tmecosys.com/image/upload/t_web767x639/img/recipe/ras/Assets/B4908103-C61E-4BCC-9609-03919F55CE7E/Derivates/60B07F46-E017-4FDD-A6A9-BDA7A09C6240.jpg',
    //     [
    //         new Ingredient('tvaroh', 100),
    //         new Ingredient('mouka', 200)
    //     ])
  ];

  constructor(private shoppingListService: ShoppingListService) { }

  getRecipe(id: number) {
    return this.recipes[id];
  }

  getRecipes() {
    return this.recipes.slice();
  }

  addIngredientsToRecepieService(ingredients: Ingredient[]) {
    this.shoppingListService.addIngredients(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.invokeChange();
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.invokeChange();
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.invokeChange();
  }

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.invokeChange();
  }

  private invokeChange() {
    this.recipesChanged.next(this.recipes.slice());
  }
}