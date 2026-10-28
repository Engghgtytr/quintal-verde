// Gaveta que sobe da base (no PC, um painel à direita). Usa o <dialog> nativo:
// ele já prende o foco, fecha com Esc e devolve o foco ao botão que abriu.
// A saída é animada: o close() nativo é trocado por um que espera a animação.

export function abrirGaveta({ titulo, conteudo, rodape = null, aoFechar = () => {} }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'gaveta';
  dialog.setAttribute('aria-labelledby', 'gaveta-titulo');
  dialog.innerHTML = `
    <div class="gaveta__cabeca">
      <h2 id="gaveta-titulo"></h2>
      <button class="gaveta__fechar" type="button" aria-label="Fechar">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div class="gaveta__corpo"></div>
    <div class="gaveta__pe"></div>`;
  dialog.querySelector('#gaveta-titulo').textContent = titulo; // texto, nunca HTML
  dialog.querySelector('.gaveta__corpo').append(conteudo);
  if (rodape) dialog.querySelector('.gaveta__pe').append(rodape);
  else dialog.querySelector('.gaveta__pe').remove();
  document.body.append(dialog);

  const fecharNativo = HTMLDialogElement.prototype.close.bind(dialog);
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fechando = false;
  dialog.close = () => {
    if (fechando) return;
    fechando = true;
    dialog.classList.add('gaveta--saindo');
    const terminar = () => { fecharNativo(); };
    if (reduzir) setTimeout(terminar, 150);
    else dialog.addEventListener('animationend', terminar, { once: true });
  };
  dialog.addEventListener('close', () => { dialog.remove(); document.body.classList.remove('sem-rolagem'); aoFechar(); });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); dialog.close(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // clique fora
  dialog.querySelector('.gaveta__fechar').addEventListener('click', () => dialog.close());

  document.body.classList.add('sem-rolagem');
  dialog.showModal();
  return dialog;
}
