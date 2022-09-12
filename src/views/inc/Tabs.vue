<template>
	<el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab" @tab-click="clickTab">
		<el-tab-pane
				v-for="(item) in editableTabs"
				:key="item.name"
				:label="item.title"
				:name="item.name"  
		>

		</el-tab-pane>
	</el-tabs>
</template>

<script>
	export default {
		name: "Tabs",
		data() {
			return {
			}
		},
		// 和动态获取菜单原理一样，要放在计算属性里，因为editableTabs、editableTabsValue都是要进行修改操作的，所以要有setter。
		computed: { 
			editableTabs: {
				get() {
					return this.$store.state.menus.editableTabs
				},
				set(val) {
					this.$store.state.menus.editableTabs = val
				}
			},
			editableTabsValue: {
				get() {
					return this.$store.state.menus.editableTabsValue
				},
				set(val) {
					this.$store.state.menus.editableTabsValue = val
				}
			}
		},
		methods: {

			removeTab(targetName) {
				let tabs = this.editableTabs; //拿到当前editableTabs（包含要删除的选项卡）
				let activeName = this.editableTabsValue; //拿到当前editableTabsValue（可能是任意一个选项卡）

				if (targetName === 'Index') {
					return  //设置首页不可关闭
				}
				/**
				 *这个方法是文档给的，直接用，意思就是重新确定激活的选项卡
				 */
				if (activeName === targetName) {
					tabs.forEach((tab, index) => {
						if (tab.name === targetName) {
							let nextTab = tabs[index + 1] || tabs[index - 1];
							if (nextTab) {
								activeName = nextTab.name;
							}
						}
					});
				}
				this.editableTabsValue = activeName; //重新设置editableTabsValue
				this.editableTabs = tabs.filter(tab => tab.name !== targetName); //用过滤器拿到不包含要删除选项卡的其他所有选项卡的数组
				this.$router.push({name: activeName})//路由到新的激活选项卡

			},
			clickTab (target) {
				this.$router.push({name: target.name})//路由的目标选项卡（编程式路由）
			}
		}
	}
</script>

<style scoped>

</style>