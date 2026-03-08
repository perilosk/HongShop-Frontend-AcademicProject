<template>
  <div class="admin-dashboard container mt-5">
    <h1 class="mb-4 text-center dashboard-title">Admin Management Tools</h1>
    <p class="text-center dashboard-subtitle">เลือกเครื่องมือที่ต้องการเพื่อจัดการข้อมูลในระบบ</p>

    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="card tool-card shadow-sm border-success">
          <div class="card-body">
            <h5 class="card-title tool-title text-success">เพิ่มสินค้าใหม่</h5>
            <p class="card-text tool-description">สร้างรายการสินค้าใหม่</p>
            <router-link to="/admin/products/add" class="btn btn-success tool-btn">
              เพิ่มสินค้า
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card tool-card shadow-sm border-warning">
          <div class="card-body">
            <h5 class="card-title tool-title text-warning">แก้ไขสินค้า</h5>
            <p class="card-text tool-description">เปลี่ยนแปลงข้อมูล, ราคา, ชื่อ หรือแบรนด์</p>
            <router-link to="/admin/products/edit" class="btn btn-warning tool-btn">
              แก้ไขสินค้า
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card tool-card shadow-sm border-danger">
          <div class="card-body">
            <h5 class="card-title tool-title text-danger">ลบสินค้า</h5>
            <p class="card-text tool-description">นำสินค้าออกจากรายการอย่างถาวร</p>
            <router-link to="/admin/products/delete" class="btn btn-danger tool-btn">
              ลบสินค้า
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card tool-card shadow-sm border-primary">
          <div class="card-body">
            <h5 class="card-title tool-title text-primary">แก้ไขบทบาทสมาชิก</h5>
            <p class="card-text tool-description">เปลี่ยนสถานะผู้ใช้ (Admin/Member)</p>
            <router-link to="/admin/members/roles" class="btn btn-primary tool-btn">
              จัดการบทบาท
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card tool-card shadow-sm border-info">
          <div class="card-body">
            <h5 class="card-title tool-title text-info">ดูรายชื่อสมาชิกทั้งหมด</h5>
            <p class="card-text tool-description">ตรวจสอบและค้นหาสมาชิกทุกคนในระบบ</p>
            <router-link to="/admin/members/list" class="btn btn-info tool-btn">
              ดูรายชื่อสมาชิก
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card tool-card shadow-sm border-secondary">
          <div class="card-body">
            <h5 class="card-title tool-title text-secondary">ประวัติการสั่งซื้อลูกค้า</h5>
            <p class="card-text tool-description">ตรวจสอบรายการสั่งซื้อและสถานะทั้งหมด</p>
            <router-link to="/admin/orders" class="btn btn-secondary tool-btn">
              ตรวจสอบประวัติ
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.dashboard-title {
  color: #333;
  font-weight: 700;
}
.dashboard-subtitle {
  color: #666;
  margin-bottom: 40px;
}
.tool-card {
  height: 100%;
  border-radius: 12px;
  transition: transform 0.2s;
}
.tool-card:hover {
  transform: translateY(-5px);
}
.tool-title {
  font-weight: 700;
}
.tool-description {
  color: #777;
  min-height: 40px;
}
.tool-btn {
  width: 100%;
  font-weight: 600;
  color: #ffff;
}

.text-warning {
  color: #d8910c !important;
}
.border-warning {
  border-color: #d8910c !important;
}
.btn-warning {
  background-color: #efa40d;
  border-color: #efa40d;
  color: white;
}
.btn-warning:hover {
  background-color: #d8910c;
  border-color: #d8910c;
}
</style>
