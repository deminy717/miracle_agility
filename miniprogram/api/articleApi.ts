// 文章相关API接口
import { get } from './request';

// 获取文章详情
export const getArticleDetail = (data: {
  id: number;
}) => {
  return get('/article/detail', data, false);
};

// 模拟文章详情数据，实际项目中删除
export const mockArticleDetail = {
  id: 1,
  title: '2023年全国犬敏捷大赛报名开始',
  author: '犬敏捷俱乐部',
  publishTime: '2023-06-15 14:30',
  views: 1255,
  content: `
    <div style="font-size: 28rpx; line-height: 1.8; color: #333;">
      <p>我们很高兴地宣布，第十届全国犬敏捷大赛将于2023年9月在北京举行，现已开始接受报名，欢迎各位爱好者积极参与！</p>
      
      <h2 style="font-size: 32rpx; font-weight: bold; margin: 30rpx 0 20rpx; color: #0066cc;">大赛背景</h2>
      
      <p>全国犬敏捷大赛是国内规模最大、水平最高的犬敏捷赛事，已成功举办九届。本次大赛由中国犬业协会主办，犬敏捷俱乐部承办，旨在促进国内犬敏捷运动的发展，提高训练水平，加强爱好者之间的交流。</p>
      
      <h2 style="font-size: 32rpx; font-weight: bold; margin: 30rpx 0 20rpx; color: #0066cc;">参赛类别</h2>
      
      <p>本次大赛设立以下几个组别：</p>
      
      <ul style="padding-left: 30rpx; margin: 20rpx 0;">
        <li>迷你组（肩高不超过35cm）</li>
        <li>中型组（肩高35-43cm）</li>
        <li>大型组（肩高超过43cm）</li>
      </ul>
      
      <p>每个组别又分为新手组、初级组、中级组和高级组四个级别。</p>
      
      <h2 style="font-size: 32rpx; font-weight: bold; margin: 30rpx 0 20rpx; color: #0066cc;">奖项设置</h2>
      
      <p>每个组别和级别都将设立冠军、亚军、季军及优胜奖。此外，还将评选最佳团队、最佳默契奖、最佳新人奖等特别奖项。</p>
      
      <h2 style="font-size: 32rpx; font-weight: bold; margin: 30rpx 0 20rpx; color: #0066cc;">报名方式</h2>
      
      <p>有意参赛者请通过以下方式报名：</p>
      
      <ol style="padding-left: 30rpx; margin: 20rpx 0;">
        <li>在线报名：访问大赛官网 www.dogagility.cn 填写报名表</li>
        <li>邮件报名：发送参赛者和犬只信息至 entry@dogagility.cn</li>
        <li>现场报名：前往各地犬敏捷俱乐部报名点报名</li>
      </ol>
      
      <p>报名截止日期为2023年8月15日，请各位参赛者抓紧时间报名。</p>
      
      <h2 style="font-size: 32rpx; font-weight: bold; margin: 30rpx 0 20rpx; color: #0066cc;">联系方式</h2>
      
      <p>如有任何疑问，请联系：</p>
      <p>电话：010-12345678</p>
      <p>邮箱：info@dogagility.cn</p>
      
      <p style="margin-top: 40rpx;">期待与各位爱好者在赛场相见！</p>
    </div>
  `,
  tags: ['赛事', '报名', '犬敏捷']
}; 