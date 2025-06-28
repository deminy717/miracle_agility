/**
 * 授权码生成器测试和对比
 * 用于测试不同编码方式的效果
 */

const mockData = require('./mockData.js')

/**
 * 测试所有编码方式
 */
function testAllMethods() {
  console.log('🔤 授权码编码方式对比测试')
  console.log('=' * 50)
  
  const methods = [
    { key: 'base32', name: '用户友好型（推荐）' },
    { key: 'timestampRandom', name: '时间戳组合型' },
    { key: 'base36', name: '标准随机型' },
    { key: 'grouped', name: '分组显示型' },
    { key: 'withChecksum', name: '校验防错型' }
  ]
  
  methods.forEach(method => {
    console.log(`\n${method.name} (${method.key}):`)
    console.log('-' * 30)
    
    // 生成10个示例
    const samples = []
    for (let i = 0; i < 10; i++) {
      samples.push(mockData.generateAccessCode(method.key))
    }
    
    console.log('示例:', samples.join(', '))
    console.log('长度:', samples[0].length, '位')
    console.log('字符集:', getCharacterSet(method.key))
    console.log('随机性:', calculateRandomness(method.key))
  })
  
  console.log('\n🎯 推荐选择:')
  console.log('- 微信小程序用户输入: base32')
  console.log('- 系统内部使用: timestampRandom')
  console.log('- 人工操作较多: grouped')
  console.log('- 高安全要求: withChecksum')
}

/**
 * 获取字符集信息
 */
function getCharacterSet(method) {
  switch(method) {
    case 'base32':
    case 'grouped':
    case 'withChecksum':
      return '32字符（去除混淆字符0,1,O,I）'
    case 'timestampRandom':
    case 'base36':
      return '36字符（0-9,A-Z）'
    default:
      return '未知'
  }
}

/**
 * 计算随机性（理论组合数）
 */
function calculateRandomness(method) {
  switch(method) {
    case 'base32':
      return `32^8 ≈ ${Math.round(Math.pow(32, 8) / 1000000000)} 万亿`
    case 'timestampRandom':
      return `36^4 * 36^4 ≈ ${Math.round(Math.pow(36, 8) / 1000000000)} 万亿（时间相关）`
    case 'base36':
      return `36^8 ≈ ${Math.round(Math.pow(36, 8) / 1000000000)} 万亿`
    case 'grouped':
      return `32^8 ≈ ${Math.round(Math.pow(32, 8) / 1000000000)} 万亿`
    case 'withChecksum':
      return `32^7 ≈ ${Math.round(Math.pow(32, 7) / 1000000)} 百万（7位随机+1位校验）`
    default:
      return '未知'
  }
}

/**
 * 测试重复率
 */
function testDuplication(method = 'base32', count = 10000) {
  console.log(`\n🔄 重复率测试 - ${method} (生成${count}个授权码)`)
  console.log('-' * 40)
  
  const codes = new Set()
  const duplicates = []
  
  for (let i = 0; i < count; i++) {
    const code = mockData.generateAccessCode(method)
    if (codes.has(code)) {
      duplicates.push(code)
    }
    codes.add(code)
  }
  
  console.log(`生成数量: ${count}`)
  console.log(`唯一数量: ${codes.size}`)
  console.log(`重复数量: ${duplicates.length}`)
  console.log(`重复率: ${(duplicates.length / count * 100).toFixed(4)}%`)
  
  if (duplicates.length > 0) {
    console.log(`重复的码: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`)
  }
  
  return {
    total: count,
    unique: codes.size,
    duplicates: duplicates.length,
    rate: duplicates.length / count
  }
}

/**
 * 性能测试
 */
function performanceTest(method = 'base32', count = 1000) {
  console.log(`\n⚡ 性能测试 - ${method} (生成${count}个授权码)`)
  console.log('-' * 40)
  
  const startTime = Date.now()
  
  for (let i = 0; i < count; i++) {
    mockData.generateAccessCode(method)
  }
  
  const endTime = Date.now()
  const duration = endTime - startTime
  const avgTime = duration / count
  
  console.log(`总时间: ${duration}ms`)
  console.log(`平均时间: ${avgTime.toFixed(3)}ms/个`)
  console.log(`生成速率: ${Math.round(count / duration * 1000)}/秒`)
  
  return {
    total: count,
    duration,
    avgTime,
    rate: count / duration * 1000
  }
}

/**
 * 全面对比测试
 */
function comprehensiveTest() {
  console.log('📊 授权码编码方式全面对比测试')
  console.log('=' * 60)
  
  const methods = ['base32', 'timestampRandom', 'base36', 'grouped', 'withChecksum']
  const results = []
  
  methods.forEach(method => {
    console.log(`\n🔍 测试方式: ${method}`)
    
    // 重复率测试
    const dupTest = testDuplication(method, 5000)
    
    // 性能测试
    const perfTest = performanceTest(method, 1000)
    
    results.push({
      method,
      duplication: dupTest.rate,
      performance: perfTest.avgTime
    })
  })
  
  console.log('\n📈 综合对比结果:')
  console.log('-' * 50)
  console.log('方法\t\t重复率\t\t平均生成时间')
  results.forEach(r => {
    console.log(`${r.method}\t${(r.duplication * 100).toFixed(4)}%\t\t${r.performance.toFixed(3)}ms`)
  })
}

/**
 * 用户体验测试（模拟用户输入混淆）
 */
function userExperienceTest() {
  console.log('\n👤 用户体验测试 - 混淆字符分析')
  console.log('-' * 40)
  
  const confusingChars = ['0', 'O', '1', 'I', 'l']
  const methods = ['base32', 'base36', 'grouped', 'withChecksum']
  
  methods.forEach(method => {
    console.log(`\n${method}:`)
    
    let totalCodes = 0
    let confusingCodes = 0
    
    // 生成1000个测试
    for (let i = 0; i < 1000; i++) {
      const code = mockData.generateAccessCode(method)
      totalCodes++
      
      if (confusingChars.some(char => code.includes(char))) {
        confusingCodes++
      }
    }
    
    console.log(`- 包含混淆字符的比例: ${(confusingCodes / totalCodes * 100).toFixed(1)}%`)
    console.log(`- 用户友好度: ${method.includes('32') || method === 'grouped' ? '高' : '中'}`)
  })
}

// 如果直接运行此文件，执行所有测试
if (typeof module !== 'undefined' && require.main === module) {
  testAllMethods()
  comprehensiveTest()
  userExperienceTest()
}

module.exports = {
  testAllMethods,
  testDuplication,
  performanceTest,
  comprehensiveTest,
  userExperienceTest
} 