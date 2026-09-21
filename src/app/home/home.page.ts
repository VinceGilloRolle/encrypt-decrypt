import { ChangeDetectorRef, Component } from '@angular/core';
import { CipherMethod, CipherService } from '../services/cipher.service';

type AppMode = 'encrypt' | 'decrypt';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  mode: AppMode = 'encrypt';
  method: CipherMethod = 'caesar';
  inputText = '';
  outputText = '';
  caesarShift = 3;
  aesPassword = '';
  errorMessage = '';
  busy = false;

  constructor(
    private cipher: CipherService,
    private cdr: ChangeDetectorRef
  ) {}

  get inputLabel(): string {
    return this.mode === 'encrypt' ? 'Plaintext' : 'Ciphertext';
  }

  get outputLabel(): string {
    return this.mode === 'encrypt' ? 'Ciphertext' : 'Plaintext';
  }

  get actionLabel(): string {
    return this.mode === 'encrypt' ? 'Encrypt' : 'Decrypt';
  }

  setMode(mode: AppMode): void {
    this.mode = mode;
    this.clearOutput();
  }

  setMethod(method: CipherMethod): void {
    this.method = method;
    this.clearOutput();
  }

  async run(): Promise<void> {
    this.errorMessage = '';
    this.outputText = '';

    const text = this.inputText;
    if (!text.trim()) {
      this.errorMessage = `Please enter ${this.inputLabel.toLowerCase()}.`;
      return;
    }

    this.busy = true;
    this.cdr.detectChanges();

    try {
      if (this.method === 'caesar') {
        this.outputText =
          this.mode === 'encrypt'
            ? this.cipher.caesarEncrypt(text, this.caesarShift)
            : this.cipher.caesarDecrypt(text, this.caesarShift);
      } else {
        this.outputText =
          this.mode === 'encrypt'
            ? await this.cipher.aesEncrypt(text, this.aesPassword)
            : await this.cipher.aesDecrypt(text, this.aesPassword);
      }
    } catch (err) {
      this.errorMessage =
        err instanceof Error ? err.message : 'Something went wrong.';
    } finally {
      this.busy = false;
      this.cdr.detectChanges();
    }
  }

  swapIO(): void {
    if (!this.outputText) {
      return;
    }
    this.inputText = this.outputText;
    this.outputText = '';
    this.errorMessage = '';
    this.mode = this.mode === 'encrypt' ? 'decrypt' : 'encrypt';
  }

  clearAll(): void {
    this.inputText = '';
    this.outputText = '';
    this.errorMessage = '';
    this.busy = false;
  }

  private clearOutput(): void {
    this.outputText = '';
    this.errorMessage = '';
  }
}
