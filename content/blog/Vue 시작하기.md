---
title: Vue 시작하기
description: >-
  서론 코로나에 재감염되서 자가격리를 또하게되었다.  회사가서 일을 못하니(현장실습이라 재택환경이 안갖춰져있다ㅠ..) 이참에 그동안 미뤄왔던
  클라이언트 공부를 해보려고한다.
date: 2022-09-13T16:49:19.869Z
tags:
  - Vue.js
---
# 서론
코로나에 재감염되서 자가격리를 또하게되었다.

회사가서 일을 못하니(현장실습이라 재택환경이 안갖춰져있다ㅠ..)
이참에 그동안 미뤄왔던 클라이언트 공부를 해보려고한다.
![](/images/3997e1eb-bb7d-4ebd-9d41-07d156312bf0-image.png)

Vue Angular React 중 무엇을 사용해볼까 고민되어 주변에 Front개발을 하는 친구에게 물어봤다. React는 입문 난이도가 높으니 러닝커브가 비교적 낮은 Vue를 사용해보는 것을 추천해줬다.

짧은 시간내로 써먹을수 있을만큼 사용하기 위해서는 러닝커브가 짧은 프레임워크가 가장 큰 매력으로 다가왔다.

# 시작하기

[공식문서](https://v3.ko.vuejs.org/guide/introduction.html)를 참고하여 진행해봤다.

Vue가 동작하는 방식은 다음과 같다.

single file components

1. main.js에서 App.vue 파일을 mount한다.
이때 bootstrap, router 등 전역으로 설정해야할 파일들을 여기서 import한다.
![](/images/27c84f47-09de-4920-ab17-8be6b9426644-image.png)

2. App.js에서 컴포넌트를 관리한다.
```vue
<template>
  <my-header v-if="this.$route.path !== '/login'"></my-header>
  <router-view></router-view>
  <my-footer v-if="this.$route.path !== '/login'"></my-footer>
</template>

<script>
import headerComponent from "@/components/header-component";
import footerComponent from "@/components/footer-component";

export default {
  name: 'App',
  data() {
    return {
      pathname: window.location.pathname
    }
  },
  components: {
    'my-header': headerComponent,
    'my-footer': footerComponent,
  }
}

</script>

<style scoped>
</style>
```
위 코드에 있는 `$route`나 `route-view`같은 것들은 view Route에 관련된 내용이라 뒤에 정리할 예정이다.

* `<template>` : html을 작성하는 부분이다.
아래 `components`에서 선언한 컴포넌트를 넣을 수도 있다.

* `<style scoped>` :  선언해두면 해당 컴포넌트에서만 style이 적용된다.

* data() ~ return : 변수를 선언, 관리할 수 있다.

* components : 컴포넌트를 선언할 수 있다.


3. 하위 컴포넌트들을 만들어준다.
대강 기능을 익히기 위해  Header, Footer, Login, main으로 만들었다.
![](/images/1eb07286-525b-4736-87d9-c7edb599dcfb-image.png)

아래는 main-contents-components.vue의 코드다.
```vue
<template>
  <div class="main-contents">
    <span>Welcome~ {{name}}</span>
    <form>
      <textarea v-model.number="message" typeof="" placeholder="여러줄도 입력해보시지 ㅋㅋ"></textarea>
      <p style="white-space: pre-line"></p>
      <div>
        <select v-model="selected">
          <option disabled value="">Please select one</option>
          <option>자유게시판</option>
          <option>유머게시판</option>
        </select>
        <div>Selected: {{ selected }}</div>
      </div>
      <button type="submit" class="btn btn-outline-primary">제출하기</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "main-contents-component",
  data() {
    return {
      number: 0,
      message: '',
      selected: ''
    }
  },
  created() {
    this.name = "최준호";
    this.number = 0;
  }
}
</script>

<style scoped>
.main-contents {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.btn {
  margin-top: 5px;
}
</style>
```
vue에서는 v-model을 이용하여 데이터 바인딩을 도와준다.
`{{ }}` ~~일명 콧수염~~ 문법 을 이용하여 데이터에 접근할 수도 있다.
![](/images/238a308b-7f5f-4eb8-8366-6c4a8ba21063-image.png)

## 라우팅

경로에 따라 보여주는 페이지를 다르게 하고싶은 고민이 생겼다.
Vue Router를 이용하여 이를 해결할 수 있었다.

> vue3부터는 vue-router가 아닌 vue-router@next를 설치해줘야한다.

`npm install vue-router@next`로 설치한다.

main.js에 router를 import 해주고 App을 mount하기 전 use(router)를 붙여준다.

```js
...
import router from "@/router";

createApp(App).use(router).mount('#app')
```

router > index.js 파일을 생성해준다.
![](/images/114c5148-edd5-4468-b411-49cc0614fd0d-image.png)

```js
// index.js
import { createWebHistory, createRouter } from "vue-router";
import mainContentsComponent from "@/components/main-contents-component";
import loginComponent from "@/components/login-component";
const routes = [
    {
        path: "/login",
        component: loginComponent,
    },
    {
        path: "/",
        component: mainContentsComponent,
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
```

routes에 경로(path)와 해당 경로에서 사용될 컴포넌트(component)를 설정해준다.

App.vue에서 `<router-view>` 부분이 위에서 설정한 컴포넌트가 보여지는 부분이다.
추가로 로그인 화면에서는 header와 footer를 보여주지 않기 위해 아래와 같이 `v-if`를 통해 조건문을 사용했다.

```vue
<template>
  <my-header v-if="this.$route.path !== '/login'"></my-header>
  <router-view></router-view>
  <my-footer v-if="this.$route.path !== '/login'"></my-footer>
</template>
```

# 결론

첫 시도동안 꽤 많은걸 알게되었다.
구현 과정간 모르는 내용을 추가로 정리하는 방식으로 포스팅을 이어나가려고 한다.

![](/images/02aa7249-fe2b-4132-9843-80e1abb8d77c-image.png)

![](/images/fc974425-8c43-46f7-8df7-9302df51c4ad-image.png)


# Reference
https://yemsu.github.io/vue3-router/
https://v3.ko.vuejs.org/guide/introduction.html
