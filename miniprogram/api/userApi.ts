// 用户相关API接口
import { post, get } from './request';

// 用户登录
export const login = (data: {
  code: string;
  userInfo: {
    nickName: string;
    avatarUrl: string;
  }
}) => {
  return post('/user/login', data, false);
};

// 获取用户信息
export const getUserInfo = () => {
  return get('/user/info');
};

// 模拟数据，实际项目中删除
export const mockUserInfo = {
  userId: 'u123456',
  nickName: '测试用户',
  avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
  gender: '男',
  phone: '13812345678',
  coursesCount: 3,
  completedCount: 1
}; 