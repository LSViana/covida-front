import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import NotFound from '@/components/NotFound'

Vue.use(VueRouter)

/**
 * @type {RouteConfig[]}
 */
const routes = [
  {
    name: 'Welcome',
    path: '/welcome',
    component: () => import(/* webpackChunkName: "welcome" */ '@/views/Welcome.vue')
  },
  {
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    children: [
      {
        name: 'Helps',
        path: '',
        component: () => import(/* webpackChunkName: "home" */ '@/components/home/Helps.vue')
      },
      {
        name: 'MyHelps',
        path: 'my-helps',
        component: () => import(/* webpackChunkName: "home" */ '@/components/home/MyHelps.vue')
      },
      {
        name: 'Profile',
        path: 'profile',
        component: () => import(/* webpackChunkName: "home" */ '@/components/home/Profile.vue')
      },
      {
        name: 'HelpChat',
        path: 'help-chat/:helpId',
        props: true,
        component: () => import(/* webpackChunkName: "helpChat" */ '@/components/home/HelpChat.vue')
      }
    ]
  },
  {
    name: 'NotFound',
    path: '*',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((from, to, next) => {
  if (from.fullPath !== to.fullPath) {
    next()
  }
})

export default router
