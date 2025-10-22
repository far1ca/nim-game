import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit,
  signal,
  TemplateRef,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface Coin {
  id: number;
}

interface Pile {
  coinsArray: Coin[];
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
  robotMoveCoins = -1;
  robotMovePile = -1;
  userMove = true;
  gameEnded = false;
  showRobotMove = false;
  private modalService = inject(NgbModal);

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.generatePiles();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 300);
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  generatePiles() {
    this.piles = Array.from({ length: this.N }, (_, i) => ({
      coinsArray: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, j) => ({
        id: i * 100 + j,
      })),
      key: i + 1,
    }));
    this.cdr.detectChanges();
  }

  makeInputVisible(key: number) {
    if (!this.userMove) return;
    this.showInput = key;
  }

  removeCoins(pile: Pile, coinsToRemove: number) {
    if (!coinsToRemove) return;
    coinsToRemove = Math.min(coinsToRemove, pile.coinsArray.length + 1);
    if (!this.userMove) {
      this.robotMoveCoins = coinsToRemove;
      this.robotMovePile = pile.key;
      this.showRobotMove = true;
      setTimeout(() => {
        this.showRobotMove = false;
        this.cdr.detectChanges();
      }, 2000); // reset robot move indicators after animation
    }
    if (coinsToRemove == pile.coinsArray.length + 1) {
      for (let i = 0; i < this.piles.length; i++) {
        if (this.piles[i].key === pile.key) {
          this.piles = this.piles.slice(0, i).concat(this.piles.slice(i + 1));
          if (!this.piles.length) {
            this.gameEnded = true;
            if (!this.userMove) this.userMove = true;
            else this.userMove = false;
            return;
          }
          this.showInput = -1;
          if (this.userMove) {
            this.robotMove();
          } else this.userMove = true;
          this.cdr.detectChanges();
          return;
        }
      }
    }
    pile.coinsArray = pile.coinsArray.slice(0, pile.coinsArray.length - coinsToRemove);
    this.showInput = -1;
    if (this.userMove) {
      this.robotMove();
    } else this.userMove = true;
    this.cdr.detectChanges();
  }

  robotMove() {
    this.userMove = false;
    setTimeout(() => {
      this.ngZone.run(() => {
        let xor = 0;
        for (const pile of this.piles) {
          xor ^= pile.coinsArray.length + 1;
        }
        if (!xor) {
          this.scrollTo('pile-' + this.piles[0].key);
          this.removeCoins(
            this.piles[0],
            Math.floor(Math.random() * this.piles[0].coinsArray.length) + 1
          );
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
            this.scrollTo('pile-' + pile.key);
            this.removeCoins(pile, coinsToRemove);
            return;
          }
        }
        this.userMove = true;
      });
    }, 3000); // wait 3s
  }

  restart() {
    this.gameEnded = false;
    this.N = 6;
    this.generatePiles();
    this.userMove = true;
  }

  scrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
