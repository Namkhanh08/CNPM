namespace CNPM_TTN.Dtos
{
    public class CreateRawMaterialRequest
    {
        public string Name { get; set; }

        public string Unit { get; set; } = "kg";

        public int CategoryId { get; set; }
    }
}
