---
title: '基数排序'
excerpt : ""
---
```java
public class RadixSort {
    public static int[] sortArray(int[] nums) {
        if (nums.length < 2) {
            return nums;
        }
        /*找出最大数*/
        int max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            max = Math.max(max, nums[i]);
        }
        /*先算出最大数的位数，它决定了我们要进行几轮排序*/
        int maxDigit = 0;
        while (max != 0) {
            max /= 10;
            maxDigit++;
        }
        /*mod,div求模与进位，例如 12%10/1=2 个位是2， 12%100/10=1 十位是1*/
        int mod = 10, div = 1;
        /*构建桶 10进制基数0~9*/
        ArrayList<ArrayList<Integer>> bucketList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            bucketList.add(new ArrayList<Integer>());
        }
        /*按照从右往左的顺序，依次将每一位都当作一次关键字，然后按照该关键字对数组排序，每一轮排序都基于上一轮排序后的结果*/
        for (int i = 0; i < maxDigit; i++, mod *= 10, div *= 10) {
            System.out.println("---第" + i + "轮排序开始---");
            for (int j = 0; j < nums.length; j++) {
                int num = (nums[j] % mod) / div;
                bucketList.get(num).add(nums[j]);
            }
            /*看看桶中的分布 */
            for (int j = 0; j < bucketList.size(); j++) {
                System.out.println("---第" + j + "个桶包含数据： " + bucketList.get(j));
            }
            /*桶中的数据写回原始数组,清除桶，准备下一轮排序*/
            int index = 0;
            for (int j = 0; j < bucketList.size(); j++) {
                for (int k = 0; k < bucketList.get(j).size(); k++) {
                    nums[index++] = bucketList.get(j).get(k);
                }
                bucketList.get(j).clear();
            }
            System.out.println("---第" + i + "轮排序结束---" + Arrays.toString(nums));
        }
        return nums;
    }
}
```
