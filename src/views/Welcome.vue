<template>
  <div>
    <div class="ui secondary pointing green inverted massive menu">
      <!-- 基本的なコンテンツはここに記載する -->
      <div class="ui" id="logo">
        GoldSteps
      </div>

    </div>
    <div class="ui main container">
      <div class="ui segment" id="exercise-level-screen">
        <h1 class="ui header">運動のレベル分け</h1>
        <p class="ui large text">自分の運動強度を選んでください！</p>
        <div class="ui divider"></div>
        <select v-model="selectedVolume" id="select" class="ui fluid dropdown huge  large">
          <option disabled value="null">選択してください</option> <!-- 追加 -->
          <option value="matsu">松(初級)：睡眠の質や気分の改善・リラックス効果など</option>
          <option value="take">竹(中級)：心肺機能、基礎代謝、認知機能の向上など</option>
          <option value="ume">梅(上級)：筋力、骨密度の向上・心臓の健康など</option>
        </select>
        <button @click="registerVolumeToDB" class="ui button  huge fluid large blue">登録</button>
        <div class="ui divider"></div>
        <div class="ui segment">
          <h2 class="ui mini-header" id="matu">【松】</h2>
          <p class="ui" id="p-header">
            生活習慣病の予防 <br><span id="span">運動習慣により体力・持久力が向上し、身体活動量を確保しやすくなること、筋肉量が増えて代謝が良くなることにより糖尿病や心筋梗塞などの虚血性心疾患、脳梗塞、大腸がんなどの発症リスクも低下させる効果があります。</span></p>
          <p class="ui" id="p-header">
            睡眠の質の改善 <br><span id="span">低強度の運動には体温調整や生活リズムの調整などの効果があります。これにより睡眠の質を改善することができます。</span></p>
          <p class="ui" id="p-header">
            リラックス効果</p>
          <p class="ui" id="p-header">
            気分の改善</p>
        </div>
        <div class="ui segment">
          <h2 class="ui mini-header" id="take">【竹】</h2>
          <p class="ui" id="p-header">
            心肺機能の向上 <br><span id="span">中強度の運動は心肺機能を向上させます。心肺機能の向上によって、日常生活の動作が楽に行えるようになります。歩行や階段の昇降などがしやすくなり、生活の質が向上します。</span></p>
          <p class="ui" id="p-header">
            基礎代謝の向上 <br><span id="span">中強度の運動によって基礎代謝が向上します。代謝が上がるとエネルギーが効率的に作られるようになり、活動的でいられます。</span></p>
          <p class="ui" id="p-header">
            認知機能の向上<br><span id="span">中強度の運動によって心肺機能を向上させると体中血液が回りやすくなり、これによって脳への酸素供給量が増え、脳が活動的になります。また普段しないような動きをすることは脳のトレーニングにもなります。</span></p>
          <p class="ui" id="p-header">
            神経系のバランス調整<br><span id="span">中程度の運動は神経系を調整し、交感神経（興奮する神経系）と副交感神経（リラックスする神経系）のバランスを取る助けとなります。副交感神経の活性化によってリラックス状態が促進されます。</span></p>
          <p class="ui" id="p-header">
            脂肪の燃焼</p>
          <p class="ui" id="p-header">
            ストレス抵抗力の向上焼</p>
          <p class="ui" id="p-header">
            免疫力の向上</p>
        </div>
        <div class="ui segment">
          <h2 class="ui mini-header" id="ume">【梅】</h2>
          <p class="ui" id="p-header">
            筋力向上 <br><span id="span">高強度の運動は筋肉に負荷がかかるため、筋力の向上が見込めます。筋力の向上によって日常生活が効率的に行えます。</span></p>
          <p class="ui" id="p-header">
            骨密度向上 <br><span id="span">高強度の運動は骨に負荷がかかるため、骨密度の向上に寄与します。骨密度が高くなると骨折しにくくなり、また強い骨は姿勢を維持する手助けをします。</span></p>
          <p class="ui" id="p-header">
            心臓の健康 <br><span id="span">高強度の運動では心臓に負荷がかかるため心臓機能の強化に寄与します。</span></p>
          <p class="ui" id="p-header">
            脳細胞の増加善</p>
          <p class="ui" id="p-header">
            細胞の自食作用の活性化</p>
          <p class="ui" id="p-header">
            神経伝達物質の放出</p>
          <p class="ui" id="p-header">
            神経保護効果</p>
          <p class="ui" id="p-header">
            脳の可塑性の向上</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { baseUrl } from '@/assets/config.js';

  export default {
    name: 'Welcome',
    data() {
      return {
        selectedVolume: null, // 初期値として設定
        userId: null
      };
    },
    methods: {

      async registerVolumeToDB() {
        const headers = { 'Authorization': 'mtiToken' };
        const requestBody = {
          volume: this.selectedVolume,
          userId: window.localStorage.getItem("userId"),
        };

        try {
          const res = await fetch(baseUrl + '/user/registerLevel', {
            method: 'PUT',
            body: JSON.stringify(requestBody),
            headers
          });

          const text = await res.text();
          const jsonData = text ? JSON.parse(text) : {};

          if (!res.ok) {
            const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
            throw new Error(errorMessage);
          }

          alert("あなたの運動強度が登録されました。");
          this.$router.push({ name: 'Home' })
        }
        catch (e) {
          alert("エラーが発生しました。松竹梅のいずれかを選択してください。")
        }
      }
    }
  };
</script>


<style>
  #exercise-level-screen {
    font-size: 18px;
    /* フォントサイズを大きく */
    background-color: #f9f9f9;
    /* 背景色を明るく */

    width: 70%;
    margin: 0 auto;
    padding-top: 10%;
  }

  .ui.header {
    font-size: 3rem;
    /* ヘッダーのフォントサイズをさらに大きく */
  }
</style>
<style scoped>
  #select {
    margin-top: 4em;
    height: 3em;
    margin-bottom: 10px;
  }

  #p-header {
    font-size: 18px;
    font-weight: bold;
  }

  #span {
    font-size: 16px;
    font-weight: normal;
  }

  #matu {
    color: brown;
  }

  #take {
    color: green;
  }

  #ume {
    color: red;
  }
   #logo {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: white;
    font-weight: bold;
    font-size: 40px;
    margin: 0 40px 0 20px;
  }
</style>
