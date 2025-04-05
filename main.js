// Chartをグローバル変数で宣言
var myChart;

// 初期値の入力
document.querySelector("input#vol").value = 20;
document.querySelector("input#amount").value = 100;
document.querySelector("input#year").value = 1;

function rnorm(){
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

function ncdf(x, mean, std) {
  var x = (x-mean)/std

  // constants
  var p  =  0.2316419;
  var b1 =  0.31938153;
  var b2 = -0.356563782;
  var b3 =  1.781477937;
  var b4 = -1.821255978;
  var b5 =  1.330274429;

  var t = 1 / (1 + p * Math.abs(x));
  var Z = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  var prob = 1 - Z * ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;

  return (x > 0) ? prob : 1 - prob;
}

function ManYen(value) {
  var man = Math.floor(Math.abs(value) / 10000) * Math.sign(value);
  var yen = parseInt(String(value).substr(-4));

  if (man == 0){
    yen = Math.sign(value) * yen
    return String(yen) + "円"
  } else{
    return String(man) + "万" + String(yen) + "円" 
  }

}

function Simulation(){

  // 1年の営業日数
  const ndays_per_year = 260;

  // 入力値代入
  var vol = parseFloat(document.querySelector("input#vol").value)/100;
  var init_value = parseFloat(document.querySelector("input#amount").value);
  var year = parseInt(document.querySelector("input#year").value);

  // 平均年率リターン設定
  var ann_mu = vol * 0.5;

  // 日次平均リターン、日次ボラティリティ
  var dmu = (1 + ann_mu) ** (1/ndays_per_year) - 1;
  var dvol = vol / Math.sqrt(ndays_per_year);

  // 投資期間日数
  var ndays = year * ndays_per_year;

  // 正規分布に基づく日次リターン系列、資産額系列の生成
  var rand_ret = Array.from(Array(ndays), () => dmu + dvol * rnorm());
  var price = Array(ndays+1);
  price[0] = init_value;
  for (i=0; i < ndays; i++){
    price[i+1] = price[i] * (1 + rand_ret[i])
  }

  // 最終資産額の計算、表示文作成
  var last_value = price[ndays];

  if (last_value > init_value){
    var img_url = "https://blog-imgs-158.fc2.com/q/u/a/quanzoo/26033951.jpg"
  } else {
    var img_url = "https://blog-imgs-158.fc2.com/q/u/a/quanzoo/25472347.jpg"
  }

  var pl = last_value - init_value
  pl = String(Math.round((pl)*10000))
  str_pl = ManYen(pl)

  document.querySelector("div#output").style.display = "block";
  document.querySelector("span#pl").textContent = str_pl;
  document.getElementById('sima').src = img_url;


  // グラフ生成
  var ctx = document.getElementById("myChart").getContext('2d');

  var labels = Array(ndays+1);
  labels[0] = 0;

  for (i=1; i < ndays+1; i++){
    if ( (i % ndays_per_year) == 0){
      labels[i] = String(i / ndays_per_year) 
    } else {
      labels[i] = ""
    }
  }

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '資産額の推移',
        data: price,
        pointRadius: 0,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            minRotation: 0,
            maxRotation: 0,
            autoSkip: false, 
            maxTicksLimit: year
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });

  // 参考情報計算
  var mean = (1 + ann_mu) ** year - 1;
  var std = vol * Math.sqrt(year);
  prob_loss = ncdf(0, mean, std);
  prob_10loss = ncdf(-0.1, mean, std)

  prob_loss = Math.round(prob_loss * 1000)/10 // パーセント表記＆少数第一位
  prob_10loss = Math.round(prob_10loss * 1000)/10 // パーセント表記＆少数第一位

  if (prob_loss == 0){
    str_prob_loss = ""
    str_prob_loss2 = "損失を出してしまう確率は限定的です"
  } else{
    str_prob_loss = String(prob_loss) + "%"
    str_prob_loss2 = "の確率で損失を出してしまいます"
  }

  if (prob_10loss == 0){
    str_prob_10loss = ""
    str_prob_10loss2 = String(init_value/10) + "万円以上損失を出してしまう確率は限定的です"
  } else{
    str_prob_10loss = String(prob_10loss) + "%"
    str_prob_10loss2 = "の確率で"+ String(init_value/10) + "万円以上の損失を出してしまいます"
  }

  document.querySelector("div#ref").style.display = "block";
  document.querySelector("span#prob_loss").textContent = str_prob_loss;
  document.querySelector("span#prob_loss2").textContent = str_prob_loss2;
  document.querySelector("span#prob_10loss").textContent = str_prob_10loss;
  document.querySelector("span#prob_10loss2").textContent = str_prob_10loss2;


  }


