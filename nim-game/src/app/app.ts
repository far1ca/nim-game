import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

interface Pile {
  coinsArray: number[];
  key: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('coinAnim', [
      // When a coin is removed from DOM
      transition(':leave', [
        animate(
          '600ms ease',
          style({
            transform: 'translateY(50px)',
            opacity: 0,
            height: '0px', // parent collapses
            width: '0px', // parent collapses
            margin: '0px',
          })
        ),
      ]),
    ]),
  ],
})
export class App implements OnInit {
  protected readonly title = signal('nim-game');

  N = 6; // number of piles
  piles: Pile[] = [];
  showInput = -1;
  userMove = true;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.generatePiles();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 300);
  }

  generatePiles() {
    this.piles = Array.from({ length: this.N }, (_, i) => ({
      coinsArray: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => 1),
      key: i + 1,
    }));
  }

  makeInputVisible(key: number) {
    if (!this.userMove) return;
    this.showInput = key;
  }

  removeCoins(pile: Pile, coinsToRemove: number) {
    if (!coinsToRemove) return;
    coinsToRemove = Math.min(coinsToRemove, pile.coinsArray.length + 1);
    if (coinsToRemove == pile.coinsArray.length + 1) {
      for (let i = 0; i < this.piles.length; i++) {
        if (this.piles[i].key == pile.key) {
          this.piles.splice(i, 1);
          console.log(this.piles);
          this.showInput = -1;
          if (this.userMove) {
            this.robotMove();
          } else this.userMove = true;
          return;
        }
      }
    }
    pile.coinsArray.splice(pile.coinsArray.length - coinsToRemove, coinsToRemove);
    console.log(this.piles);
    this.showInput = -1;
    if (this.userMove) {
      this.robotMove();
    } else this.userMove = true;
  }

  robotMove() {
    this.userMove = false;
    setTimeout(() => {
      let xor = 0;
      for (const pile of this.piles) {
        xor ^= pile.coinsArray.length + 1;
      }
      if (!xor) {
        this.removeCoins(
          this.piles[0],
          Math.floor(Math.random() * this.piles[0].coinsArray.length) + 1
        );
        this.cdr.detectChanges();
        return;
      }
      let d = 0;
      for (let i = 0; i < 10; ++i) {
        if ((xor >> i) & 1) d = i;
      }
      for (const pile of this.piles) {
        const pileSize = pile.coinsArray.length + 1;
        if ((pileSize >> d) & 1) {
          const targetSize = pileSize ^ xor;
          const coinsToRemove = pileSize - targetSize;
          this.removeCoins(pile, coinsToRemove);
          this.cdr.detectChanges();
          return;
        }
      }
      this.userMove = true;
    }, 3000); // wait 3s
  }
}
