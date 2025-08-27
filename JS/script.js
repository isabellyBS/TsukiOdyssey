document.addEventListener('DOMContentLoaded', () => {
  // Dados do jogo - pares para conectar
  const pairs = [
      { left: 'Tsuki', right: 'Coelho' },
      { left: 'Chi', right: 'Girafa' },
      { left: 'Moca', right: 'Tartaruga' },
      { left: 'Rosemary', right: 'Porquinha-da-índia' },
      { left: 'Bobo', right: 'Urso panda' },
      { left: 'Momo', right: 'Preguiça' }
  ];
  
  const leftColumn = document.getElementById('left-column');
  const rightColumn = document.getElementById('right-column');
  const connectorContainer = document.getElementById('connector-container');
  const resetBtn = document.getElementById('reset-btn');
  const hintBtn = document.getElementById('hint-btn');
  const scoreDisplay = document.getElementById('score');
  const successMessage = document.getElementById('success-message');
  
  let leftSelected = null;
  let rightSelected = null;
  let matchedPairs = 0;
  let connectors = [];
  
  // Embaralhar os pares
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }
  
  // Inicializar o jogo
  function initGame() {
      // Limpar colunas e conectores
      leftColumn.innerHTML = '';
      rightColumn.innerHTML = '';
      connectorContainer.innerHTML = '';
      connectors = [];
      matchedPairs = 0;
      leftSelected = null;
      rightSelected = null;
      scoreDisplay.textContent = `Pares conectados: 0/${pairs.length}`;
      successMessage.style.display = 'none';
      
      // Embaralhar os itens
      const shuffledLeft = shuffleArray([...pairs.map(pair => pair.left)]);
      const shuffledRight = shuffleArray([...pairs.map(pair => pair.right)]);
      
      // Adicionar itens à coluna da esquerda
      shuffledLeft.forEach(item => {
          const div = document.createElement('div');
          div.className = 'item';
          div.textContent = item;
          div.dataset.value = item;
          div.addEventListener('click', () => selectLeft(item, div));
          leftColumn.appendChild(div);
      });
      
      // Adicionar itens à coluna da direita
      shuffledRight.forEach(item => {
          const div = document.createElement('div');
          div.className = 'item';
          div.textContent = item;
          div.dataset.value = item;
          div.addEventListener('click', () => selectRight(item, div));
          rightColumn.appendChild(div);
      });
  }
  
  // Selecionar item da esquerda
  function selectLeft(value, element) {
      // Se já está selecionado, desselecionar
      if (leftSelected === element) {
          element.classList.remove('selected');
          leftSelected = null;
          return;
      }
      
      // Remover seleção anterior
      if (leftSelected) {
          leftSelected.classList.remove('selected');
      }
      
      // Selecionar novo item
      element.classList.add('selected');
      leftSelected = element;
      
      // Se ambos os lados estão selecionados, verificar se é um par
      if (leftSelected && rightSelected) {
          checkMatch();
      }
  }
  
  // Selecionar item da direita
  function selectRight(value, element) {
      // Se já está selecionado, desselecionar
      if (rightSelected === element) {
          element.classList.remove('selected');
          rightSelected = null;
          return;
      }
      
      // Remover seleção anterior
      if (rightSelected) {
          rightSelected.classList.remove('selected');
      }
      
      // Selecionar novo item
      element.classList.add('selected');
      rightSelected = element;
      
      // Se ambos os lados estão selecionados, verificar se é um par
      if (leftSelected && rightSelected) {
          checkMatch();
      }
  }
  
  // Verificar se os itens selecionados formam um par
  function checkMatch() {
      const leftValue = leftSelected.dataset.value;
      const rightValue = rightSelected.dataset.value;
      
      // Verificar se é um par válido
      const isValidPair = pairs.some(pair => 
          pair.left === leftValue && pair.right === rightValue
      );
      
      if (isValidPair) {
          // Par correto
          leftSelected.classList.add('matched');
          rightSelected.classList.add('matched');
          leftSelected.classList.remove('selected');
          rightSelected.classList.remove('selected');
          
          // Desenhar conector
          drawConnector(leftSelected, rightSelected);
          
          matchedPairs++;
          scoreDisplay.textContent = `Pares conectados: ${matchedPairs}/${pairs.length}`;
          
          // Verificar se o jogo terminou
          if (matchedPairs === pairs.length) {
              successMessage.style.display = 'block';
          }
      } else {
          // Par incorreto - aguardar um pouco e depois remover a seleção
          setTimeout(() => {
              leftSelected.classList.remove('selected');
              rightSelected.classList.remove('selected');
          }, 1000);
      }
      
      // Resetar seleções
      leftSelected = null;
      rightSelected = null;
  }
  
  // Desenhar uma linha conectando os itens
  function drawConnector(leftElement, rightElement) {
      const leftRect = leftElement.getBoundingClientRect();
      const rightRect = rightElement.getBoundingClientRect();
      const containerRect = connectorContainer.getBoundingClientRect();
      
      const leftX = leftRect.right - containerRect.left;
      const leftY = leftRect.top + leftRect.height / 2 - containerRect.top;
      
      const rightX = rightRect.left - containerRect.left;
      const rightY = rightRect.top + rightRect.height / 2 - containerRect.top;
      
      const distance = Math.sqrt(Math.pow(rightX - leftX, 2) + Math.pow(rightY - leftY, 2));
      const angle = Math.atan2(rightY - leftY, rightX - leftX) * 180 / Math.PI;
      
      const connector = document.createElement('div');
      connector.className = 'connector matched';
      connector.style.width = `${distance}px`;
      connector.style.left = `${leftX}px`;
      connector.style.top = `${leftY}px`;
      connector.style.transform = `rotate(${angle}deg)`;
      
      connectorContainer.appendChild(connector);
      connectors.push(connector);
  }
  
  // Fornecer uma dica
  function giveHint() {
      if (matchedPairs >= pairs.length) return;
      
      // Encontrar um par que ainda não foi conectado
      for (const pair of pairs) {
          const leftElement = Array.from(leftColumn.children).find(
              el => el.dataset.value === pair.left && !el.classList.contains('matched')
          );
          
          const rightElement = Array.from(rightColumn.children).find(
              el => el.dataset.value === pair.right && !el.classList.contains('matched')
          );
          
          if (leftElement && rightElement) {
              // Destacar os itens do par
              leftElement.style.backgroundColor = '#f39c12';
              rightElement.style.backgroundColor = '#f39c12';
              
              // Remover o destaque após um tempo
              setTimeout(() => {
                  leftElement.style.backgroundColor = '';
                  rightElement.style.backgroundColor = '';
              }, 2000);
              
              break;
          }
      }
  }
  
  // Event listeners
  resetBtn.addEventListener('click', initGame);
  hintBtn.addEventListener('click', giveHint);
  
  // Iniciar o jogo
  initGame();
});