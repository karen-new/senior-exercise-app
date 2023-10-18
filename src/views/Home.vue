<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <!-- loading表示用 -->
      <div class="ui active inverted page dimmer" v-if="isCallingApi">
        <div class="ui text loader">Loading</div>
      </div>

      <!-- エラーメッセージ用-->
      <p class="ui negative message" v-if="errorMsg">
        <i class="close icon" @click="clearMsg('error')"></i>
        <span class="header">エラーが発生しました！</span>
        {{ errorMsg }}
      </p>

      <!-- 成功メッセージ用-->
      <p class="ui positive message" v-if="successMsg">
        <i class="close icon" @click="clearMsg"></i>
        <span class="header">成功！</span>
        {{ successMsg }}
      </p>

      <!-- 入力ボックス -->
      <div class="ui segment">
        <form>
          <div class="inline field">
            <!-- for="article-category"をtimeに -->
            <h1>運動タスク</h1>
            <ul>
              <li>{{ exercise }}をしましょう！</li>
              <li>{{ time }}分を目安に運動をしましょう！</li>
              <li>心拍数は{{goal}}を目指しましょう！</li>
            </ul>
            <hr>
            <label for="vital">運動後の心拍数（回／分）</label>
            <input
              v-model.number="vital"
              type="number"
            />
            <p>
              {{ result }}
            </p>
          </div>
          <div class="right-align">
            <button
              @click='checkResult'
              class="ui green button"
              v-bind:able="checkResult"
              type="button"
            >
              送信
            </button>
          </div>
        </form>
      </div>
      
      <!-- 投稿一覧-->
      <h3 class="ui dividing header">自分の運動記録</h3>
      <div class="ui segment">
        <ul class="ui comments divided article-list">
          <template v-for="(team2_user, index) in team2_users" :key="index">
            <li class="comment">
              <div class="content">
                <span class="author">{{ team2_user.userId }}</span>
                <!-- timestampの項目がteam2_userにないため日時表示できない？　<div class="metadata">
                  <span class="date">{{
                    convertToLocaleString(team2_user.timestamp)
                  }}</span>
                </div> -->
                <button
                  v-if="isMyArticle(team2_user.userId)"
                  class="ui negative mini button right floated"
                  @click="deleteArticle(team2_user)"
                >
                  削除
                </button>
                <p class="exp">
                  EXP:{{ team2_user.exp }}
                </p>
                <p class="age">
                  AGE:{{ team2_user.age }}
                </p>
                
                <div class="ui divider"></div>
              </div>
            </li>
          </template>
        </ul>
      </div> 
      
    </div>
  </div>
</template>

<script>
import { baseUrl } from "@/assets/config.js";

const headers = { Authorization: "mtiToken", "Access-Control-Allow-Origin": "*" };

export default {
  name: "Home",

  data() {
    return {
      post: {
        age: null,
        exp: null,
        vital:null,
      },
      search: {
        userId: null,
        age: null,
        start: null,
        end: null,
      },
      articles: [],
      iam: null,
      userId: null,
      age:null,
      exp:0,
      vital:null,
      timestamp:null,
      successMsg: "",
      errorMsg: "",
      isCallingApi: false,
      user:{
        userId:"",
        age:80,
      },
      team2_users:[],
      team2_goals:[],
      result:"",
      goal:"",
      exercise:"",
      time:20,
    };
  },

  computed: {
    isPostButtonDisabled() {
      return !this.post.text;
    },

    isSearchButtonDisabled() {
      return !this.search.userId;
    },
  },

  created: async function () {
    // apiからarticleを取得する
    if (
      window.localStorage.getItem("token")
    ) {
      this.iam = window.localStorage.getItem("userId");
    } else {
      window.localStorage.clear();
      this.$router.push({ name: "Login" });
    }
    await this.getUser();
    await this.getVital();
    const exercise = await this.getExercise();
    await this.exerciseExplanation(exercise);
  },

  methods: {
    async checkResult() {
    //入力された心拍数を基準値と比べ、完了の可否を決定
      let weight;
      if(this.volume==="matu"){
        weight=0.7;
      }else if(this.volume==="take"){
        weight=0.6;
      }else{
        weight=0.5;
      }
      
      if((220-this.team2_users[0].age)*weight <= this.vital && this.vital<= (220-this.team2_users[0].age)*(weight+0.1)){
          this.team2_users[0].exp+=100;
          this.result = "運動目標達成です！経験値を100獲得しました！";
      }else{
          this.result = "あとひといきです！次はがんばりましょう! ";
      }
      await this.changeExp(this.user.userId,this.team2_users[0].exp);
    },
    
    async getUser(){
      //ユーザーの取得
      try {
        this.user.userId=window.localStorage.getItem("userId");
        /* global fetch */
        const res = await fetch(
          //baseUrl + "/user?userId=isogami",
          `${baseUrl}/user?userId=${this.user.userId}`,
          {
            method: "GET",
            headers,
          }
        );
        
        const user = await res.json();
        console.log(user);
        this.team2_users=[user];
        this.user=user;

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
        this.isCallingApi = false;
      }
    },
    
    async getVital(){
    //目標心拍数を求める
      let weight=0.0;
      if(this.volume==="matu"){
        weight=0.7;
      }else if(this.volume==="take"){
        weight=0.6;
      }else{
        weight=0.5;
      }
      this.goal=(220-this.user.age)*weight;
    },
    
    async getExercise(){
    //運動の種類をvolumeごとにランダムに表示
      try {
        /* global fetch */
        const res = await fetch(
          //baseUrl + "/user?userId=isogami",
          `${baseUrl}/home/getExercise`,
          {
            method: "GET",
            headers,
          }
        );
        
        const text = await res.json();
        const jsonData = text || {};
        
        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }
        else {
        const exercises = jsonData.exercises ?? [];
        //ログインユーザーのvolumeに合わせた運動をピックアップ
        const filteredExercises = exercises.filter(exercise => exercise.volume === this.user.volume);
        console.log(filteredExercises);
        //ピックアップした運動からランダムに表示
        if (filteredExercises.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredExercises.length);
          return filteredExercises[randomIndex];
        } else {
          const errorMessage = "exerciseがありません";
          throw new Error(errorMessage);
        }
        }
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
        this.isCallingApi = false;
      }
    },
    
    exerciseExplanation(exercise) {
      console.log(exercise)
      //ストレッチ系の場合は心拍数を低下に設定、他の場合はgetvitalの通り
      //todo:無酸素運動と有酸素運動でも分ける
      if (exercise.type == "stretch"){
        this.goal = "低下すること";
      }
      if (exercise.exerciseId == "walking"){
        this.exercise = "ウォーキング";
        this.time = 20;
      }
      else if (exercise.exerciseId == "stretch"){
        this.exercise = "ストレッチ";
        this.time = 20;
      }
      else if (exercise.exerciseId == "walking2"){
        this.exercise = "ウォーキング";
        this.time = 30;
      }
      else{
        console.error("無効な運動です");
      }
    },
    
    clearMsg(target) {
      if (target === "error") {
        this.errorMsg = "";
      } else {
        this.successMsg = "";
      }
    },

    isMyArticle(id) {
      return this.iam === id;
    },


    async postArticle() {
      if (this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;

      const reqBody = {
        userId: this.iam,
        age: this.post.age,
        exp: this.post.exp,
      };
      try {
        /* global fetch */
        const res = await fetch(baseUrl + "/user", {
          method: "POST",
          body: JSON.stringify(reqBody),
          headers,
        });

        const age = await res.age();
        const jsonData = age ? JSON.parse(age) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        this.team2_user.unshift({ ...reqBody, timestamp: Date.now() });
        this.successMsg = "運動情報が投稿されました！";
        this.post.age = "";
        this.post.exp = "";
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
        this.isCallingApi = false;
      }
    },

    async deleteArticle(team2_user) {
      if (this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;

      const { userId, timestamp } = team2_user;
      try {
        /* global fetch */
        const res = await fetch(
          //baseUrl + "/user?userId=hoho",
          `${baseUrl}/user?userId=${this.user.userId}`,//
          {
            method: "GET",
            headers,
          }
        );

        const age = await res.age();
        const jsonData = age ? JSON.parse(age) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        const deleted = this.team2_user.findIndex(
          (a) => a.userId === userId && a.timestamp === timestamp
        );
        this.team2_user.splice(deleted, 1);
        this.successMsg = "運動情報が削除されました！";
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
        this.isCallingApi = false;
      }
    },
    
    async changeExp(userId,exp){
      console.log("changed")
      try {
        const body = JSON.stringify({
          userId,
          exp,
        })
        /* global fetch */
        const res = await fetch(
          //baseUrl + "/user?userId=isogami",
          `${baseUrl}/home/getExp`,
          {
            method: "PUT",
            headers,
            body,
          }
        );
        console.log(res)
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
      }
    },
    async changeVital(age){
      console.log("changed")
      try {
        const body = JSON.stringify({
          age,
        })
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
      }
    },

    convertToLocaleString(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  },
};
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 100%;
}
.right-align {
  text-align: right;
}
ul {
  list-style-type: none;
}
li {
  font-size:20px;
  position: relative;
  line-height: 1.8;
}
li::after {
  content: '';
  display: block;
  position: absolute;
  top: .5em;
  left: -1.5em;
  width: 10px;
  height: 5px;
  border-left: 3px solid #9c9c9c;
  border-bottom: 3px solid #9c9c9c;
  transform: rotate(-45deg);
}
hr {
  border-top: 1px dashed #000; /* 破線 */
  margin:30px;
  
}
</style>
