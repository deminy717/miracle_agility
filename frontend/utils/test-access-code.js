/**
 * 授权码功能测试脚本
 * 在微信开发者工具控制台中运行此脚本来测试授权码功能
 */

// 测试授权码生成
function testAccessCodeGeneration() {
  console.log('🧪 测试授权码生成功能')
  console.log('=' * 40)
  
  const mockData = require('./mockData.js')
  
  // 测试base32编码（默认）
  console.log('\n📱 Base32编码测试（推荐用于微信小程序）:')
  for (let i = 0; i < 5; i++) {
    const code = mockData.generateAccessCode('base32')
    console.log(`  ${i + 1}. ${code} (${code.length}位)`)
  }
  
  // 测试其他编码方式
  const methods = ['timestampRandom', 'base36', 'grouped', 'withChecksum']
  methods.forEach(method => {
    console.log(`\n📋 ${method} 编码测试:`)
    for (let i = 0; i < 3; i++) {
      const code = mockData.generateAccessCode(method)
      console.log(`  ${i + 1}. ${code}`)
    }
  })
}

// 测试API模拟
function testMockAPI() {
  console.log('\n🔗 测试Mock API接口')
  console.log('=' * 40)
  
  const mockData = require('./mockData.js')
  
  // 测试生成授权码API
  const generateParams = {
    courseId: 1,
    description: 'Base32测试授权码',
    usageLimit: 1,
    validHours: 24,
    codeMethod: 'base32'
  }
  
  const result = mockData.getMockData('/api/courses/access-codes/generate', generateParams, 'POST')
  console.log('\n✅ 生成授权码API响应:', result)
  
  // 测试获取授权码列表API
  const listResult = mockData.getMockData('/api/courses/access-codes/course/1', {}, 'GET')
  console.log('\n📋 获取授权码列表API响应:', listResult)
}

// 测试前端页面逻辑
function testPageLogic() {
  console.log('\n🖥️ 测试前端页面逻辑')
  console.log('=' * 40)
  
  // 模拟课程管理页面的授权码生成流程
  const courseId = 1
  const courseTitle = '犬敏捷入门基础'
  
  console.log(`📚 课程: ${courseTitle} (ID: ${courseId})`)
  console.log('\n📝 有效期选项:')
  const validityOptions = [
    { hours: 24, description: '24小时有效' },
    { days: 7, description: '7天有效' },
    { days: 30, description: '30天有效' },
    { days: 90, description: '90天有效' },
    { days: 365, description: '365天有效' },
    { permanent: true, description: '永久有效' }
  ]
  
  validityOptions.forEach((option, index) => {
    console.log(`  ${index + 1}. ${option.description}`)
  })
  
  // 模拟选择第一个选项（24小时有效）
  const selected = validityOptions[0]
  console.log(`\n✅ 选择: ${selected.description}`)
  
  // 模拟生成请求参数
  const requestData = {
    courseId: courseId,
    description: `授权码(${selected.description})`,
    usageLimit: 1,
    validHours: selected.hours,
    codeMethod: 'base32'
  }
  
  console.log('\n📤 生成请求参数:', requestData)
  
  // 模拟API响应
  const mockData = require('./mockData.js')
  const response = mockData.getMockData('/api/courses/access-codes/generate', requestData, 'POST')
  console.log('\n📥 API响应:', response)
  
  // 模拟成功弹窗内容
  const content = `授权码：${response.code}\n\n说明：${response.description}\n⚠️ 注意：\n• 每个授权码只能使用1次\n• 使用后即刻失效`
  console.log('\n💬 弹窗内容:')
  console.log(content)
}

// 运行所有测试
function runAllTests() {
  console.clear()
  console.log('🚀 授权码功能完整测试')
  console.log('=' * 50)
  
  testAccessCodeGeneration()
  testMockAPI()
  testPageLogic()
  
  console.log('\n🎉 测试完成！')
  console.log('\n📋 使用说明:')
  console.log('1. 进入课程管理页面')
  console.log('2. 点击"管理授权码" → "生成新授权码"')
  console.log('3. 选择有效期（直接下拉选择，无需多层弹窗）')
  console.log('4. 自动使用Base32编码生成授权码')
  console.log('5. 弹窗显示授权码，点击"复制授权码"按钮')
  console.log('\n💡 Base32特点: 8位长度，无混淆字符(0/O/1/I)，用户友好')
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testAccessCodeGeneration,
    testMockAPI,
    testPageLogic,
    runAllTests
  }
}

// 自动运行测试（如果直接执行此文件）
if (typeof module !== 'undefined' && require.main === module) {
  runAllTests()
}

// 在控制台中可用的全局函数
if (typeof window !== 'undefined') {
  window.testAccessCode = {
    testAccessCodeGeneration,
    testMockAPI,
    testPageLogic,
    runAllTests
  }
} 