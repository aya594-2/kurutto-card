const choiceCard = document.getElementById("choiceCard");
const cardMessage = document.getElementById("cardMessage");
const drawButton = document.getElementById("drawButton");
const updateButton = document.getElementById("updateButton");
const itemsInput = document.getElementById("itemsInput");
const result = document.getElementById("result");
const itemCount = document.getElementById("itemCount");

// 抽選する項目
let items = ["ゲーム", "雑談", "歌枠", "質問コーナー"];

// 抽選中かどうかを管理する
let isDrawing = false;

let history = JSON.parse(localStorage.getItem("cardHistory")) || [];

let totalCount = Number(localStorage.getItem("totalDrawCount")) || 0;
const totalCountDisplay = document.getElementById("totalCount");

function renderTotalCount() {
  totalCountDisplay.textContent = `累計抽選回数：${totalCount}回`;
}

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");


function renderHistory() {
    historyList.innerHTML = "";

    if (history.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "history-empty";
        emptyItem.textContent = "まだ履歴はないよ♡";
        historyList.appendChild(emptyItem);
        return;
    }

    history.forEach((item, index) => {
        const listItem = document.createElement("li");

        const name = typeof item === "string" ? item : item.name;
        const date = typeof item === "string" ? "" : item.date;

        // 結果を表示
        const nameText = document.createElement("div");
        nameText.textContent = `${index + 1}. 🎉 ${name}`;
        listItem.appendChild(nameText);

        // 日時を表示
        if (date) {
            const dateText = document.createElement("small");
            dateText.textContent = date;
            dateText.style.display = "block";
            dateText.style.marginTop = "6px";
            dateText.style.color = "#a77d91";
            listItem.appendChild(dateText);
        }

        // 個別削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "この履歴を削除";
        deleteButton.className = "history-delete-button";

        deleteButton.addEventListener("click", () => {
            history.splice(index, 1);

            localStorage.setItem(
                "cardHistory",
                JSON.stringify(history)
            );

            renderHistory();
        });

        listItem.appendChild(deleteButton);
        historyList.appendChild(listItem);
    });
}


// 項目を画面に反映する
function updateItems() {
  if (isDrawing) return;

  const newItems = itemsInput.value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item !== "");

  if (newItems.length < 2) {
    result.textContent = "項目を2個以上入力してね！";
    return;
  }

  if (newItems.length > 50) {
    result.textContent = "項目は50個までにしてね！";
    return;
  }

  items = newItems;

  itemCount.textContent = `登録項目：${items.length}個`;
  cardMessage.textContent = "準備はいい？";
  result.textContent = "準備OK！カードをめくってみよう♪";
}

// カードをめくって抽選する

function drawCard() {
  if (isDrawing || items.length < 2) return;

  isDrawing = true;
  drawButton.disabled = true;
  updateButton.disabled = true;

  // 結果をいったん隠して、期待感を演出
  result.textContent = "何が出るかな……？";
  result.classList.remove("show-result");
  cardMessage.textContent = "ドキドキ……♡";

  // カードの色をランダムに変更
  const colors = ["pink", "lavender", "mint"];
  choiceCard.classList.remove("pink", "lavender", "mint");

  const colorIndex = Math.floor(Math.random() * colors.length);
  choiceCard.classList.add(colors[colorIndex]);

  // カードの回転アニメーションを開始
  choiceCard.classList.remove("flipping");
  void choiceCard.offsetWidth;
  choiceCard.classList.add("flipping");

  // 直前の抽選結果を取得する
  const lastWinner = history.length > 0 ? history[0] : null;

  // 直前と同じ項目を抽選候補から除外する
  let candidates = items.filter((item) => item !== lastWinner);

  // 候補からランダムに選ぶ
  const winnerIndex = Math.floor(Math.random() * candidates.length);
  const winner = candidates[winnerIndex];

  // 少し待ってから、キラキラと結果を表示
  setTimeout(() => {
    createSparkles();

    cardMessage.textContent = winner;
    result.textContent = `🎉 ${winner}`;

    // 抽選結果と日時を履歴の先頭に追加
    const now = new Date();

    const dateTime = now.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    history.unshift({
      name: winner,
      date: dateTime,
    });

    // 累計抽選回数を1増やす
    totalCount++;

    // 累計回数をブラウザに保存
    localStorage.setItem("totalDrawCount", totalCount);

    // 画面の表示を更新
    renderTotalCount();

    // 履歴は最新20件まで残す
    history = history.slice(0, 20);

    // 履歴を保存して画面に反映
    localStorage.setItem("cardHistory", JSON.stringify(history));
    renderHistory();

    result.classList.remove("show-result");
    void result.offsetWidth;
    result.classList.add("show-result");

    // 結果発表エリアを光らせる
    const resultArea = document.querySelector(".result-area");
    resultArea.classList.remove("show-celebration");
    void resultArea.offsetWidth;
    resultArea.classList.add("show-celebration");

    choiceCard.classList.remove("flipping");

    isDrawing = false;
    drawButton.disabled = false;
    updateButton.disabled = false;
  }, 800);
}

/* キラキラを飛ばす */
function createSparkles() {
  const rect = choiceCard.getBoundingClientRect();
  const symbols = ["✦", "✧", "✨", "♡"];

  for (let i = 0; i < 12; i++) {
    const sparkle = document.createElement("span");

    sparkle.className = "sparkle";
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    // カードの周りを基準に配置する
    sparkle.style.left = `${rect.left + rect.width / 2}px`;
    sparkle.style.top = `${rect.top + rect.height / 2}px`;

    // 飛び散る方向をランダムに決める
    const x = Math.random() * 240 - 120;
    const y = Math.random() * 240 - 120;

    sparkle.style.setProperty("--x", `${x}px`);
    sparkle.style.setProperty("--y", `${y}px`);

    document.body.appendChild(sparkle);

    // アニメーション終了後に削除する
    sparkle.addEventListener("animationend", () => {
      sparkle.remove();
    });
  }
}

// ボタンを押したときの処理
drawButton.addEventListener("click", drawCard);
updateButton.addEventListener("click", updateItems);

/* 履歴をクリアする */

clearHistoryButton.addEventListener("click", () => {
  history = [];
  localStorage.setItem("cardHistory", JSON.stringify(history));
  renderHistory();
});

// 最初の表示
itemsInput.value = items.join("\n");
itemCount.textContent = `登録項目：${items.length}個`;
renderTotalCount();
