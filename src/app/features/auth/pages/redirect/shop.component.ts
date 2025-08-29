import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-shop-redirect',
  template: ''
})
export class ShopRedirectComponent implements OnInit {
    ngOnInit(): void {
      window.location.href = 'https://eispri-stic.sumupstore.com/produits';
    }
}