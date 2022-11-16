---
title: '桶排序'
excerpt : ""
---
```java
public class BucketSort {
    /**
     * @param array
     * @param bucketCap 桶的容量，即每个桶所能放置多少个不同数值
     * @return
     */
    public static ArrayList<Integer> sortArray(ArrayList<Integer> array, int bucketCap) {
        if (array == null || array.size() < 2) return array;
        int max = array.get(0);
        int min = array.get(0);
        /*找到最大值和最小值*/
        for (int i = 0; i < array.size(); i++) {
            max = Math.max(max, array.get(i));
            min = Math.min(min, array.get(i));
        }
        /*获得桶的数量*/
        int bucketCount = (max - min) / bucketCap + 1;
        /*构建桶*/
        ArrayList<ArrayList<Integer>> bucketArr = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) {
            bucketArr.add(new ArrayList<>());
        }
        /*将原始数组中的数据分配到桶中*/
        for (int i = 0; i < array.size(); i++) {
            bucketArr.get((array.get(i) - min) / bucketCap).add(array.get(i));
        }
        /*看看桶中的数据分布*/
        for (int i = 0; i < bucketArr.size(); i++) {
            System.out.println("第" + i + "个桶包含数据:" + bucketArr.get(i).toString());
        }
        ArrayList<Integer> resultArr = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) {
            if (bucketCap == 1) {
                for (int j = 0; j < bucketArr.get(i).size(); j++) {
                    resultArr.add(bucketArr.get(i).get(j));
                }
            } else {
                if (bucketCount == 1) {
                    bucketCap--;
                }
                System.out.println("对第" + i + "桶中的数据再次用桶进行排序---");
                /*对桶中的数据再次用桶进行排序*/
                ArrayList<Integer> temp = sortArray(bucketArr.get(i), bucketCap);
                for (int j = 0; j < temp.size(); j++) {
                    resultArr.add(temp.get(j));
                    System.out.println("resultArr桶中的数据再次用桶进行排序---");

                }
            }
        }
        return resultArr;
    }
}

```
