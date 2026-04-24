import { TemplateEngine, ViewObject } from '../../../lib/template-engine';
import { Validators }                 from '../../../lib/utils/validators';
import { ImcService }                 from '../services/imc-service';
import { ImcStore }                   from '../store/imc-store';

let _view: ViewObject | null = null;

export const ImcScreen = {
  init(parent: HTMLElement): void {
    _view = TemplateEngine.init(parent, this._template(), 'screen-root');

    ImcStore.subscribe((state) => {
      _view!.update('#imc-result-value',       state.result   ? state.result.toFixed(2) : '--');
      _view!.update('#imc-result-description', state.category ?? '');
    });

    this._bindEvents();
  },

  _template(): string {
    return `
      <div data-role="header" data-theme="b">
        <h1>Calculateur d'IMC</h1>
      </div>
      <div data-role="content">
        <form class="imc-form">
          <div data-role="fieldcontain">
            <label for="taille">Taille en cm :</label>
            <input type="number" id="taille" placeholder="Taille en cm" />
          </div>
          <div data-role="fieldcontain">
            <label for="poids">Poids en kg :</label>
            <input type="number" id="poids" placeholder="Poids en kg" />
          </div>
          <button type="submit" data-role="button" data-theme="b">Calculer</button>
        </form>
        <ul data-role="listview" data-inset="true">
          <li>IMC : <span id="imc-result-value">--</span></li>
          <li id="imc-result-description"></li>
        </ul>
      </div>
    `;
  },

  _bindEvents(): void {
    _view!.el('.imc-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const height = (_view!.el('#taille') as HTMLInputElement).value;
      const weight = (_view!.el('#poids')  as HTMLInputElement).value;

      if (!Validators.validateHeight(height)) return void alert('Veuillez entrer une taille valide (cm).');
      if (!Validators.validateWeight(weight))  return void alert('Veuillez entrer un poids valide (kg).');

      const imc      = ImcService.calculate(parseFloat(weight), parseFloat(height));
      const category = ImcService.getCategory(imc);
      ImcStore.setState({ height, weight, result: imc, category });
    });
  }
};
