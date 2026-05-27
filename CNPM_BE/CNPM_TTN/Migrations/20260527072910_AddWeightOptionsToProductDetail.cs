using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CNPM_TTN.Migrations
{
    /// <inheritdoc />
    public partial class AddWeightOptionsToProductDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK__Roasting__3214EC071AC1EAA3",
                table: "RoastingBatches");

            migrationBuilder.DropPrimaryKey(
                name: "PK__ProductD__3214EC07BA243111",
                table: "ProductDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Carts__3214EC0779D0F81D",
                table: "Carts");

            migrationBuilder.DropPrimaryKey(
                name: "PK__CartItem__3214EC071C398D6B",
                table: "CartItems");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Vouchers",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vouchers",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxDiscount",
                table: "Vouchers",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Vouchers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Vouchers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsageLimit",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Position",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "MemberTier",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Bronze",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Contact",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CommitmentEndDate",
                table: "Subscriptions",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CommitmentMonths",
                table: "Subscriptions",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryDay",
                table: "Subscriptions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FarmingZoneId",
                table: "ProductDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeightOptions",
                table: "ProductDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FinalAmount",
                table: "Orders",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                table: "OrderDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Weight",
                table: "OrderDetails",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HarvestBatchId",
                table: "InventoryReceipts",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedDate",
                table: "InventoryLogs",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                table: "CartItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Weight",
                table: "CartItems",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoastingBatches",
                table: "RoastingBatches",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__ProductD__3214EC07E5557A5E",
                table: "ProductDetails",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Carts__3214EC0729294429",
                table: "Carts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__CartItem__3214EC073FDAD60C",
                table: "CartItems",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Certifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Issuer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Certific__3214EC0769BA00A6", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FarmingZones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Province = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Altitude = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SoilType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Climate = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__FarmingZ__3214EC07FA99CF09", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    SKU = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Weight = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProductV__3214EC07263252F1", x => x.Id);
                    table.ForeignKey(
                        name: "FK__ProductVa__Produ__30C33EC3",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    FlavorNote = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    GrindType = table.Column<int>(type: "int", nullable: true),
                    Weight = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionConfigs_GrindingOptions",
                        column: x => x.GrindType,
                        principalTable: "GrindingOptions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SubscriptionConfigs_Products",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SubscriptionConfigs_Subscriptions",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionId = table.Column<int>(type: "int", nullable: false),
                    DeliveryDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    SnapshotDetails = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    ReceiverName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    ReceiverPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ShippingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionOrders_Subscriptions",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ReceiverName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Province = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ward = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DetailAddress = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserAddr__3214EC07C41E6E9D", x => x.Id);
                    table.ForeignKey(
                        name: "FK__UserAddre__UserI__37703C52",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VoucherCategories",
                columns: table => new
                {
                    VoucherId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherCategories", x => new { x.VoucherId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_VoucherCategories_Categories",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VoucherCategories_Vouchers",
                        column: x => x.VoucherId,
                        principalTable: "Vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VoucherProducts",
                columns: table => new
                {
                    VoucherId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherProducts", x => new { x.VoucherId, x.ProductId });
                    table.ForeignKey(
                        name: "FK_VoucherProducts_Products",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VoucherProducts_Vouchers",
                        column: x => x.VoucherId,
                        principalTable: "Vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Farmers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FarmingZoneId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Scale = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FarmingMethod = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Story = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Farmers__3214EC0741117776", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Farmers__Farming__3D2915A8",
                        column: x => x.FarmingZoneId,
                        principalTable: "FarmingZones",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FarmerCertifications",
                columns: table => new
                {
                    FarmerId = table.Column<int>(type: "int", nullable: false),
                    CertificationId = table.Column<int>(type: "int", nullable: false),
                    IssueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DocumentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__FarmerCe__C238F6D017DBAD49", x => new { x.FarmerId, x.CertificationId });
                    table.ForeignKey(
                        name: "FK__FarmerCer__Certi__42E1EEFE",
                        column: x => x.CertificationId,
                        principalTable: "Certifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__FarmerCer__Farme__41EDCAC5",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HarvestBatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BatchCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FarmerId = table.Column<int>(type: "int", nullable: false),
                    RawMaterialId = table.Column<int>(type: "int", nullable: false),
                    HarvestDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ProcessingMethod = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    QualityScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__HarvestB__3214EC07BFCBDEB5", x => x.Id);
                    table.ForeignKey(
                        name: "FK__HarvestBa__Farme__46B27FE2",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__HarvestBa__RawMa__47A6A41B",
                        column: x => x.RawMaterialId,
                        principalTable: "RawMaterials",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductDetails_FarmingZoneId",
                table: "ProductDetails",
                column: "FarmingZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ProductVariantId",
                table: "OrderDetails",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReceipts_HarvestBatchId",
                table: "InventoryReceipts",
                column: "HarvestBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductVariantId",
                table: "CartItems",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_FarmerCertifications_CertificationId",
                table: "FarmerCertifications",
                column: "CertificationId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmers_FarmingZoneId",
                table: "Farmers",
                column: "FarmingZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_HarvestBatches_FarmerId",
                table: "HarvestBatches",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "IX_HarvestBatches_RawMaterialId",
                table: "HarvestBatches",
                column: "RawMaterialId");

            migrationBuilder.CreateIndex(
                name: "UQ__HarvestB__B22ADA8E5C80BC6E",
                table: "HarvestBatches",
                column: "BatchCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionConfigs_GrindType",
                table: "SubscriptionConfigs",
                column: "GrindType");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionConfigs_ProductId",
                table: "SubscriptionConfigs",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionConfigs_SubscriptionId",
                table: "SubscriptionConfigs",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionOrders_SubscriptionId",
                table: "SubscriptionOrders",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAddresses_UserId",
                table: "UserAddresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherCategories_CategoryId",
                table: "VoucherCategories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherProducts_ProductId",
                table: "VoucherProducts",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK__CartItems__Produ__339FAB6E",
                table: "CartItems",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK__Inventory__Harve__489AC854",
                table: "InventoryReceipts",
                column: "HarvestBatchId",
                principalTable: "HarvestBatches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK__OrderDeta__Produ__3493CFA7",
                table: "OrderDetails",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK__ProductDe__Farmi__498EEC8D",
                table: "ProductDetails",
                column: "FarmingZoneId",
                principalTable: "FarmingZones",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__CartItems__Produ__339FAB6E",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK__Inventory__Harve__489AC854",
                table: "InventoryReceipts");

            migrationBuilder.DropForeignKey(
                name: "FK__OrderDeta__Produ__3493CFA7",
                table: "OrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK__ProductDe__Farmi__498EEC8D",
                table: "ProductDetails");

            migrationBuilder.DropTable(
                name: "FarmerCertifications");

            migrationBuilder.DropTable(
                name: "HarvestBatches");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropTable(
                name: "SubscriptionConfigs");

            migrationBuilder.DropTable(
                name: "SubscriptionOrders");

            migrationBuilder.DropTable(
                name: "UserAddresses");

            migrationBuilder.DropTable(
                name: "VoucherCategories");

            migrationBuilder.DropTable(
                name: "VoucherProducts");

            migrationBuilder.DropTable(
                name: "Certifications");

            migrationBuilder.DropTable(
                name: "Farmers");

            migrationBuilder.DropTable(
                name: "FarmingZones");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoastingBatches",
                table: "RoastingBatches");

            migrationBuilder.DropPrimaryKey(
                name: "PK__ProductD__3214EC07E5557A5E",
                table: "ProductDetails");

            migrationBuilder.DropIndex(
                name: "IX_ProductDetails_FarmingZoneId",
                table: "ProductDetails");

            migrationBuilder.DropIndex(
                name: "IX_OrderDetails_ProductVariantId",
                table: "OrderDetails");

            migrationBuilder.DropIndex(
                name: "IX_InventoryReceipts_HarvestBatchId",
                table: "InventoryReceipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Carts__3214EC0729294429",
                table: "Carts");

            migrationBuilder.DropPrimaryKey(
                name: "PK__CartItem__3214EC073FDAD60C",
                table: "CartItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_ProductVariantId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "MaxDiscount",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "UsageLimit",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "CommitmentEndDate",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CommitmentMonths",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "DeliveryDay",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "FarmingZoneId",
                table: "ProductDetails");

            migrationBuilder.DropColumn(
                name: "WeightOptions",
                table: "ProductDetails");

            migrationBuilder.DropColumn(
                name: "FinalAmount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "OrderDetails");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "OrderDetails");

            migrationBuilder.DropColumn(
                name: "HarvestBatchId",
                table: "InventoryReceipts");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "CartItems");

            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "Users",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Position",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "MemberTier",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Bronze");

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Contact",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedDate",
                table: "InventoryLogs",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Roasting__3214EC071AC1EAA3",
                table: "RoastingBatches",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__ProductD__3214EC07BA243111",
                table: "ProductDetails",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Carts__3214EC0779D0F81D",
                table: "Carts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__CartItem__3214EC071C398D6B",
                table: "CartItems",
                column: "Id");
        }
    }
}
