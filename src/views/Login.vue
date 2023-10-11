<template>
  <div><div class="ui secondary pointing green inverted massive menu">
        <!-- 基本的なコンテンツはここに記載する -->
        <div class="ui" id="logo">
          GoldSteps
        </div>

      </div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      
      <!-- 発展課題のローディング表示用 -->
      <div class="ui active inverted page dimmer" v-if="isCallingApi">
        <div class="ui text loader">Loading</div>
      </div>

      <div class="ui segment">
        <!-- 発展課題のエラーメッセージ用-->
        <p class="ui negative message" v-if="errorMsg">
          <i class="close icon" @click="clearError"></i>
          <span class="header">エラーが発生しました！</span>
          {{ errorMsg }}
        </p>

        <!-- submitイベントを拾って、preventにて規定のアクションを中止し、submitメソッドを呼び出す。-->
        <form class="ui large form" @submit.prevent="submit">
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userId" type="text" placeholder="ユーザー名" />
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="password" placeholder="パスワード" />
            </div>
          </div>

          <div class="field" v-if="!isLogin">
            <div class="ui left icon input">
              <i class="calendar icon"></i>
              <input v-model.number="user.age" type="number" min="0" placeholder="年齢" />
            </div>
          </div>

          <button class="ui huge green fluid button" :disabled="isButtonDisabled" type="submit">{{ submitBtnText }}</button>
        </form>
      </div>

      <button @click="toggleMode" class="ui huge grey fluid button" type="submit">{{ toggledBtnText }}</button>
    </div>
  </div>
</template>

<script>
  // 必要なものはここでインポートする
  // @は/srcの同じ意味です
  // import something from '@/components/something.vue';
  import { baseUrl } from '@/assets/config.js';
  
  const headers = { "Access-Control-Allow-Origin": "*" };

  export default {
    name: 'Login',

    components: {
      // 読み込んだコンポーネント名をここに記述する
    },

    data() {
      // Vue.jsで使う変数はここに記述する
      return {
        isLogin: true,
        user: {
          userId: null,
          password: null,
          age: null
        },
        errorMsg: '', // 発展課題のエラーメッセージ用
        isCallingApi: false // 発展課題のローディング表示用
      };
    },

    computed: {
      // 計算した結果を変数として利用したいときはここに記述する

      // 発展課題のボタン活性/非活性用
      isButtonDisabled() {
        const { userId, password, age } = this.user;
        return this.isLogin ?
          !userId || !password :
          !userId || !password || !age;
      },

      submitBtnText() {
        return this.isLogin ? 'ログイン' : '新規登録'
      },

      toggledBtnText() {
        return this.isLogin ? '新規登録' : 'ログイン'
      }
    },


    methods: {
      // Vue.jsで使う関数はここで記述する

      // 発展課題のエラーメッセージ用
      clearError() {
        this.errorMsg = ''
      },

      toggleMode() {
        this.isLogin = !this.isLogin;
      },

      async submit() {
        if (this.isCallingApi) {
          return;
        }
        this.isCallingApi = true;

        const path = this.isLogin ? '/user/login' : '/user/signup';
        const { userId, password, age } = this.user;
        const reqBody = this.isLogin ?
          { userId, password } :
          { userId, password, age };
        console.log(userId, password);
        try {
          /* global fetch */
          const res = await fetch(baseUrl + path, {
            method: 'POST',
            body: JSON.stringify(reqBody),
            headers
          });

          const text = await res.text();
          const jsonData = text ? JSON.parse(text) : {}

          if (!res.ok) {
            const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
            throw new Error(errorMessage);
          }

          // トークンやユーザーIDを保存
          window.localStorage.setItem('token', jsonData.token);
          window.localStorage.setItem('userId', this.user.userId);

          // 新規登録の場合に限り、/welcome へ遷移する
          if (!this.isLogin) {
            this.$router.push('/welcome');
          }
          else {
            this.$router.push({ name: 'Home' })
          }
        }
        catch (e) {
          console.error(e);
          this.errorMsg = e;
        }
        finally {
          this.isCallingApi = false;
        }
      }

    },
  }
</script>

<style scoped>
  /* このコンポーネントだけに適用するCSSはここに記述する */
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
