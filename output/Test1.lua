return {
	{"唯一ID", "布尔值", "整形", "浮点数", "字符串", "数组", "二维数组", "数组字典", "字典", "字典数组", "字典二维数组"},
	{"id", "bool_data", "int_data", "float_data", "string_data", "arr_data", "arr2_data", "arr3_data", "dic_data", "dic2_data", "dic2_data"},
	{1, true, 100, 1.2, "哈哈", {1001, 1002}, {{1,2}, {3,4}, {5,6}}, {{id=1, num=2}, {id=3, num=4}}, {id=1001, num=1002}, {id=1001, nums={1,2,3}}, {id=1001, nums={{1,2}, {3,4}}}},
	{2, false, 200, 0.1, "呵呵", {200, 300}, {{2,4}, {7}}, {{id=5, num=6}, {id=7, num=8}}, {id=1001, num=1002}, {id=1001, nums={1,2,3}}, {id=1001, nums={{1,2}, {3,4}}}}
}