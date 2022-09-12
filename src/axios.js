import axios from "axios";
import router from "./router";
import Element from "element-ui"

axios.defaults.baseURL = "http://localhost:8081" //定义统一axios前缀

const request = axios.create({ //定义request对象统一进行配置，比如超时时间timeout、请求头'Content-Type'
  timeout: 50000,
  headers: {
    'Content-Type': "application/json; charset=utf-8"
  }
})

//设置request的interceptos前置拦截器，除了登录不需要带上token，其他的所有请求都要携带token【从localStore获取比较方便】
request.interceptors.request.use(config => {
  config.headers['Authorization'] = localStorage.getItem("token")
  return config
})
//设置request的interceptos后置拦截器
request.interceptors.response.use(
  response => {
    //这里是响应成功，后端在全局异常处理器中把异常处理为统一响应对象返回给前端。可以得到异常状态码、异常信息
    console.log("response ->" + response)
    let res = response.data
    if (res.code === 200) {
      return response     //响应码为200代表响应正常，直接放行
    } else {
      //利用Element.Message的type=error主题弹消息
      Element.Message.error(!res.msg ? '系统异常' : res.msg) //三目表达式，如果后端没有传来异常信息。默认为'系统异常'
      return Promise.reject(response.data.msg)    //Promise.reject  进行拒绝
    }
  },
  error => {//这里是请求失败，也就是请求后端的某个接口出现异常

    console.log(error)

    if (error.response.data) {
      error.massage = error.response.data.msg  // error.response.data是错误的响应，.msg是Result对象msg属性的值。

      if (error.response.status === 401) { //error.response.status 是响应状态码 浏览器得到
        router.push("/login") //401未认证，调到登录页面
      }

      Element.Message.error(error.massage, { duration: 3000 })
      return Promise.reject(error)
    }
  }
)

export default request