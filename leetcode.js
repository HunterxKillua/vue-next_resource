var longestPalindrome = function (s) {
  let max = 0 // 当前最大回文串的长度
  let maxStr = '' // 当前最大的回文串
  for (let i = 0; i < s.length; i++) {
    let str = s[i] // 当前遍历的这个字符为中心的回文串
    while (s[i + 1] === s[i]) { // 找到当前字符后连接的所有一样的字符,更新 i 的指针和 str,获取连续的字符
      console.log(s[i], s[i + 1])
      str += s[i]
      i++
    }
    let r = i + 1 // 右侧遍历开始索引
    let l = i - 1 // 左侧遍历开始索引
    while (s[l] === s[r] && s[l] !== undefined) { // 从连续字符两端开始像两侧扩展,直到越界或者不一致,一致的直接拼到 str 中
      str = s[l] + str + s[l]
      l--
      r++
    }
    if (str.length > max) { // 判断与之前最大的对比
      max = str.length
      maxStr = str
    }
  }
  return maxStr
};

const a = [1,8,6,2,5,4,8,3,7];

var maxArea = function(height) {
  const len = height.length;
  if (len < 1) {
    return 0
  }
  if (len === 1) {
    return height[0]
  }
  let area = 0;
  for(let i = 0; i < len; i++) {
      let ptr_r = len - i - 1;
      while(i < ptr_r) {
        if (height[i] < height[ptr_r]) {
            const areas = (ptr_r - i) * height[i]
            if (area < areas) {
              area = areas
            }
            i++;
        } else {
            const areas = (ptr_r - i) * height[ptr_r]
            if (areas > area) {
              area = areas
            }
            ptr_r--;
        }
      }
  }
  return area;
};

maxArea([2, 1]);
